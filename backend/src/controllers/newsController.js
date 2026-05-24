const axios = require('axios');
const pool = require('../db/pool');
const Groq = require('groq-sdk');

const GNEWS_BASE = 'https://gnews.io/api/v4';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getNewsByTopic = async (req, res) => {
  const { topic = 'technology', page = 1 } = req.query;
  try {
    const response = await axios.get(`${GNEWS_BASE}/top-headlines`, {
      params: { topic, lang: 'en', max: 10, page, apikey: process.env.GNEWS_API_KEY }
    });
    const articles = response.data.articles || [];
    storeEmbeddings(articles);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
};

const searchNews = async (req, res) => {
  const { q, page = 1 } = req.query;
  if (!q) return res.status(400).json({ error: 'Query is required' });
  try {
    const response = await axios.get(`${GNEWS_BASE}/search`, {
      params: { q, lang: 'en', max: 10, page, apikey: process.env.GNEWS_API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
};

const getPersonalizedFeed = async (req, res) => {
  try {
    const topicsResult = await pool.query('SELECT topic FROM user_topics WHERE user_id = $1', [req.user.id]);
    const topics = topicsResult.rows.map(r => r.topic);
    if (topics.length === 0) {
      const response = await axios.get(`${GNEWS_BASE}/top-headlines`, {
        params: { lang: 'en', max: 10, apikey: process.env.GNEWS_API_KEY }
      });
      return res.json(response.data);
    }
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const response = await axios.get(`${GNEWS_BASE}/top-headlines`, {
      params: { topic: randomTopic, lang: 'en', max: 10, apikey: process.env.GNEWS_API_KEY }
    });
    res.json({ ...response.data, activeTopic: randomTopic });
  } catch (err) {
    res.status(500).json({ error: 'Feed fetch failed', details: err.message });
  }
};

async function storeEmbeddings(articles) {
  for (const a of articles) {
    try {
      await pool.query(
        `INSERT INTO article_embeddings (title, description, url, embedding)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (url) DO NOTHING`,
        [a.title, a.description, a.url, JSON.stringify([])]
      );
    } catch (e) {
      console.error('Store error:', e.message);
    }
  }
}

const askAI = async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question required' });
  try {
    const words = question.toLowerCase().split(' ').filter(w => w.length > 3);
    const searchTerm = words.length > 0 ? words.join(' | ') : question;

    const result = await pool.query(
      `SELECT title, description, url FROM article_embeddings
       WHERE to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))
       @@ to_tsquery('english', $1)
       LIMIT 3`,
      [searchTerm]
    );

    const context = result.rows.length > 0
      ? result.rows.map((r, i) => `Article ${i + 1}: ${r.title}. ${r.description}`).join('\n')
      : 'No specific articles found, answer generally about the topic.';

    const chat = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a news assistant. Answer based on the articles provided. Be concise.' },
        { role: 'user', content: `Articles:\n${context}\n\nQuestion: ${question}` }
      ]
    });

    res.json({
      answer: chat.choices[0].message.content,
      sources: result.rows
    });
  } catch (err) {
    console.error('askAI error:', err.message);
    res.status(500).json({ error: 'AI failed', details: err.message });
  }
};

module.exports = { getNewsByTopic, searchNews, getPersonalizedFeed, askAI };