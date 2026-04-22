const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const register = async (req, res) => {
  const { name, email, password, topics = [] } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'All fields are required' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashed]
    );
    const user = result.rows[0];

    if (topics.length > 0) {
      for (const topic of topics) {
        await pool.query(
          'INSERT INTO user_topics (user_id, topic) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user.id, topic]
        );
      }
      await pool.query(
        'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
        [user.id, `Welcome to NewsNest, ${name}! Your personalized feed is ready.`]
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, topics } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const topicsResult = await pool.query('SELECT topic FROM user_topics WHERE user_id = $1', [user.id]);
    const topics = topicsResult.rows.map(r => r.topic);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, topics } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [req.user.id]);
    const topicsResult = await pool.query('SELECT topic FROM user_topics WHERE user_id = $1', [req.user.id]);
    const topics = topicsResult.rows.map(r => r.topic);
    res.json({ ...result.rows[0], topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateTopics = async (req, res) => {
  const { topics } = req.body;
  try {
    await pool.query('DELETE FROM user_topics WHERE user_id = $1', [req.user.id]);
    for (const topic of topics) {
      await pool.query('INSERT INTO user_topics (user_id, topic) VALUES ($1, $2)', [req.user.id, topic]);
    }
    res.json({ message: 'Topics updated', topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { register, login, getMe, updateTopics };
