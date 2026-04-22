import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './NewsCard.css';

export default function NewsCard({ article, isLiked: initialLiked = false, isBookmarked: initialBookmarked = false }) {
  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const res = await api.post('/likes/toggle', { article_url: article.url });
      setLiked(res.data.liked);
    } catch {
      toast.error('Failed to like');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarked) return;
    setLoading(true);
    try {
      await api.post('/bookmarks', {
        article_url: article.url,
        title: article.title,
        description: article.description,
        image: article.image,
        source: article.source?.name,
        published_at: article.publishedAt,
      });
      setBookmarked(true);
      toast.success('Bookmarked!');
    } catch (err) {
      if (err.response?.status === 409) { setBookmarked(true); toast('Already bookmarked'); }
      else toast.error('Failed to bookmark');
    } finally {
      setLoading(false);
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
    <article className="news-card fade-in">
      {article.image && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="card-img-wrap">
          <img src={article.image} alt={article.title} className="card-img" loading="lazy" />
        </a>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="card-source">{article.source?.name || 'Unknown'}</span>
          <span className="card-time">{timeAgo(article.publishedAt)}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="card-title">
          {article.title}
        </a>
        {article.description && (
          <p className="card-desc">{article.description?.slice(0, 120)}...</p>
        )}
        <div className="card-actions">
          <button
            className={`action-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={loading}
            aria-label="Like"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {liked ? 'Liked' : 'Like'}
          </button>
          <button
            className={`action-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmark}
            disabled={loading || bookmarked}
            aria-label="Bookmark"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {bookmarked ? 'Saved' : 'Save'}
          </button>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="action-btn read-btn">
            Read →
          </a>
        </div>
      </div>
    </article>
  );
}
