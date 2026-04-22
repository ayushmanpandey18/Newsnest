const axios = require('axios');
const pool = require('../db/pool');

const GNEWS_BASE = 'https://gnews.io/api/v4';

const getNewsByTopic = async (req, res) => {
  const { topic = 'technology', page = 1 } = req.query;
  try {
    const response = await axios.get(`${GNEWS_BASE}/top-headlines`, {
      params: {
        topic,
        lang: 'en',
        max: 10,
        page,
        apikey: process.env.GNEWS_API_KEY
      }
    });
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

module.exports = { getNewsByTopic, searchNews, getPersonalizedFeed };
