import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const ALL_TOPICS = ['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'world', 'nation'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleTopic = (t) => setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (topics.length === 0) return toast.error('Pick at least one topic!');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, topics);
      toast.success('Welcome to NewsNest!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card auth-card-wide fade-in">
        <div className="auth-header">
          <span className="auth-logo-icon">🪺</span>
          <h1 className="auth-title">Join NewsNest</h1>
          <p className="auth-subtitle">Personalized news, just for you</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input type="text" placeholder="Ayush Kumar" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} minLength={6} required />
          </div>

          <div className="field">
            <label>Pick your interests <span style={{color:'var(--text3)',fontWeight:400}}>({topics.length} selected)</span></label>
            <div className="topics-grid">
              {ALL_TOPICS.map(t => (
                <button
                  key={t}
                  type="button"
                  className={`topic-chip ${topics.includes(t) ? 'active' : ''}`}
                  onClick={() => toggleTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="spin" style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block'}} /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
