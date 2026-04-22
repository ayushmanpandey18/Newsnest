import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './Bookmarks.css';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks')
      .then(res => setBookmarks(res.data))
      .catch(() => toast.error('Failed to load bookmarks'))
      .finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks(prev => prev.filter(b => b.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Bookmarks</h1>
          <span className="page-count">{bookmarks.length} saved</span>
        </div>

        {loading ? (
          <div className="bm-list">
            {[...Array(4)].map((_, i) => <div key={i} className="bm-skeleton" />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h3>No bookmarks yet</h3>
            <p>Save articles from your feed to read them later</p>
          </div>
        ) : (
          <div className="bm-list">
            {bookmarks.map(b => (
              <div key={b.id} className="bm-item fade-in">
                {b.image && <img src={b.image} alt={b.title} className="bm-img" loading="lazy" />}
                <div className="bm-content">
                  <div className="bm-meta">
                    <span className="bm-source">{b.source || 'Unknown'}</span>
                    <span className="bm-time">{timeAgo(b.created_at)}</span>
                  </div>
                  <a href={b.article_url} target="_blank" rel="noopener noreferrer" className="bm-title">
                    {b.title}
                  </a>
                  {b.description && <p className="bm-desc">{b.description?.slice(0, 100)}...</p>}
                </div>
                <button className="bm-remove" onClick={() => removeBookmark(b.id)} title="Remove bookmark">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
