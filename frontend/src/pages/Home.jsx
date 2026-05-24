import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import NewsCard from '../components/NewsCard';
import api from '../utils/api';
import './Home.css';

const TOPICS = ['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'world', 'nation'];

export default function Home() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(user?.topics?.[0] || 'world');
  const [likedUrls, setLikedUrls] = useState([]);
  const [bookmarkedUrls, setBookmarkedUrls] = useState([]);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchLikedAndBookmarked = async () => {
    try {
      const [likesRes, bookRes] = await Promise.all([
        api.get('/likes'),
        api.get('/bookmarks')
      ]);
      setLikedUrls(likesRes.data);
      setBookmarkedUrls(bookRes.data.map(b => b.article_url));
    } catch {}
  };

  const fetchNews = useCallback(async (topic) => {
    setLoading(true);
    try {
      const res = await api.get(`/news?topic=${topic}`);
      setArticles(res.data.articles || []);
    } catch {}
    finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLikedAndBookmarked();
    fetchNews(activeTopic);
  }, []);

  const handleTopicChange = (topic) => {
    setActiveTopic(topic);
    fetchNews(topic);
  };

  const askAI = async () => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await api.post('/news/ask', { question });
      setAiAnswer(res.data);
    } catch (err) {
      console.error('AI Error:', err.response?.data || err.message);
      toast.error('AI failed, try again');
    } finally {
      setAiLoading(false);
    }
  };

  const userTopics = user?.topics?.length > 0 ? user.topics : TOPICS;

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <div>
            <h1 className="home-title">Good {getGreeting()}, <span className="name-highlight">{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p className="home-subtitle">Here's what's happening in the world</p>
          </div>
        </div>

        <div className="topics-bar">
          {TOPICS.map(t => (
            <button
              key={t}
              className={`topic-pill ${activeTopic === t ? 'active' : ''} ${userTopics.includes(t) ? 'preferred' : ''}`}
              onClick={() => handleTopicChange(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="ai-box">
          <div className="ai-input-row">
            <input
              type="text"
              placeholder="Ask AI about today's news..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
            />
            <button onClick={askAI} disabled={aiLoading}>
              {aiLoading ? '...' : 'Ask AI'}
            </button>
          </div>
          {aiAnswer && (
            <div className="ai-answer">
              <p>{aiAnswer.answer}</p>
              <div className="ai-sources">
                {aiAnswer.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer">
                    📰 {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="news-grid">
            {articles.length === 0
              ? <div className="empty-state"><p>No articles found for this topic.</p></div>
              : articles.map((article, i) => (
                <NewsCard
                  key={article.url || i}
                  article={article}
                  isLiked={likedUrls.includes(article.url)}
                  isBookmarked={bookmarkedUrls.includes(article.url)}
                />
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}