import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const ALL_TOPICS = ['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'world', 'nation'];

export default function Profile() {
  const { user, updateTopics, logout } = useAuth();
  const [topics, setTopics] = useState(user?.topics || []);
  const [saving, setSaving] = useState(false);

  const toggleTopic = (t) => setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = async () => {
    if (topics.length === 0) return toast.error('Select at least one topic');
    setSaving(true);
    try {
      await updateTopics(topics);
      toast.success('Preferences saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-container">
        <div className="page-header" style={{borderBottom:'1px solid var(--border)',paddingBottom:'1.5rem',marginBottom:'2rem'}}>
          <h1 className="page-title">Profile</h1>
        </div>

        <div className="profile-avatar-section">
          <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="section-title">Your Interests</h3>
          <p className="section-desc">Choose topics to personalize your feed</p>
          <div className="topics-grid">
            {ALL_TOPICS.map(t => (
              <button
                key={t}
                className={`topic-chip ${topics.includes(t) ? 'active' : ''}`}
                onClick={() => toggleTopic(t)}
              >
                {t}
                {topics.includes(t) && <span className="topic-check">✓</span>}
              </button>
            ))}
          </div>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        <div className="profile-section danger-section">
          <h3 className="section-title" style={{color:'var(--red)'}}>Account</h3>
          <button className="logout-full-btn" onClick={logout}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}
