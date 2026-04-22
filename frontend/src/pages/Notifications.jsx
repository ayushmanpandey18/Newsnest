import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed');
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="page">
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Notifications</h1>
            {unreadCount > 0 && <p style={{color:'var(--text2)',fontSize:'0.85rem',marginTop:'0.25rem'}}>{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>
          )}
        </div>

        {loading ? (
          <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            {[...Array(5)].map((_,i) => <div key={i} style={{height:70,background:'var(--card)',borderRadius:'var(--radius)',border:'1px solid var(--border)',animation:'pulse 1.5s ease-in-out infinite'}} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>Start bookmarking articles to see notifications here</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`notif-item fade-in ${!n.is_read ? 'unread' : ''}`}>
                <div className="notif-dot" />
                <div className="notif-content">
                  <p className="notif-msg">{n.message}</p>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
