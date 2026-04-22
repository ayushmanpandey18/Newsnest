const pool = require('../db/pool');

const toggleLike = async (req, res) => {
  const { article_url } = req.body;
  if (!article_url) return res.status(400).json({ error: 'article_url required' });
  try {
    const existing = await pool.query(
      'SELECT id FROM likes WHERE user_id = $1 AND article_url = $2',
      [req.user.id, article_url]
    );
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM likes WHERE user_id = $1 AND article_url = $2', [req.user.id, article_url]);
      return res.json({ liked: false });
    }
    await pool.query('INSERT INTO likes (user_id, article_url) VALUES ($1, $2)', [req.user.id, article_url]);
    res.json({ liked: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLikedArticles = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT article_url FROM likes WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows.map(r => r.article_url));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { toggleLike, getLikedArticles };
