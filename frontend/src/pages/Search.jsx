import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import NewsCard from '../components/NewsCard';
import './Search.css';

export default function Search() {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/news/search?q=${encodeURIComponent(query)}`);
      setArticles(res.data.articles || []);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-container" style={{maxWidth:1200}}>
        <div className="search-header">
          <h1 className="page-title">Search News</h1>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for anything..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? '...' : 'Search'}
            </button>
          </form>
        </div>

        {loading ? (
          <div className="news-grid">
            {[...Array(6)].map((_,i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : searched && articles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try a different keyword</p>
          </div>
        ) : (
          <div className="news-grid">
            {articles.map((a, i) => <NewsCard key={a.url || i} article={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
