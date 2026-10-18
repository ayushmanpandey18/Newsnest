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
    if (topic === activeTopic && !loading) return;
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
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-header">
          <div>
            <h1 className="home-title">Good {getGreeting()}, <span className="name-highlight">{firstName}</span> 👋</h1>
            <p className="home-subtitle">Here's what's happening in the world</p>
          </div>
          <div className="header-date">
            <span className="date-dot"></span>
            <span>{getFormattedDate()}</span>
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
          <div className="ai-box-header">
            <div className="ai-title">
              <span className="ai-badge">✦ AI</span>
              <span>Ask NewsNest Intelligence</span>
            </div>
            {aiAnswer && (
              <button 
                type="button" 
                className="ai-clear-btn" 
                onClick={() => { setAiAnswer(null); setQuestion(''); }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="ai-input-row">
            <input
              type="text"
              placeholder="Ask AI about today's news..."
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
            />
            <button className="ai-ask-btn" onClick={askAI} disabled={aiLoading || !question.trim()}>
              {aiLoading ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </div>
          {aiAnswer && (
            <div className="ai-answer-card">
              <div className="ai-answer-content">
                <p>{aiAnswer.answer}</p>
              </div>
              {aiAnswer.sources && aiAnswer.sources.length > 0 && (
                <div className="ai-sources-wrap">
                  <span className="ai-sources-label">Sources:</span>
                  <div className="ai-sources-list">
                    {aiAnswer.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="ai-source-tag">
                        <span className="source-dot"></span>
                        <span className="source-title">{s.title || 'Source'}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="section-header">
          <h2 className="section-title">
            <span className="topic-capitalize">{activeTopic}</span> News
          </h2>
          {!loading && articles.length > 0 && (
            <span className="article-count">{articles.length} {articles.length === 1 ? 'story' : 'stories'}</span>
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

function getFormattedDate() {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}