const pool = require('../db/pool');

const addBookmark = async (req, res) => {
  const { article_url, title, description, image, source, published_at } = req.body;
  if (!article_url || !title) return res.status(400).json({ error: 'URL and title required' });
  try {
    const result = await pool.query(
      `INSERT INTO bookmarks (user_id, article_url, title, description, image, source, published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (user_id, article_url) DO NOTHING RETURNING *`,
      [req.user.id, article_url, title, description, image, source, published_at]
    );
    if (result.rows.length === 0) return res.status(409).json({ error: 'Already bookmarked' });
    await pool.query(
      'INSERT INTO notifications (user_id, message) VALUES ($1, $2)',
      [req.user.id, `Article bookmarked: "${title.slice(0, 60)}..."`]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookmarks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeBookmark = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM bookmarks WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addBookmark, getBookmarks, removeBookmark };
