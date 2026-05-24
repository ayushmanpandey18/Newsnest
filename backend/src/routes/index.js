const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, getMe, updateTopics } = require('../controllers/authController');
const { getNewsByTopic, searchNews, getPersonalizedFeed, askAI } = require('../controllers/newsController');
const { addBookmark, getBookmarks, removeBookmark } = require('../controllers/bookmarkController');
const { toggleLike, getLikedArticles } = require('../controllers/likeController');
const { getNotifications, markAllRead, getUnreadCount } = require('../controllers/notificationController');

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', auth, getMe);
router.put('/auth/topics', auth, updateTopics);

// News
router.get('/news', auth, getNewsByTopic);
router.get('/news/search', auth, searchNews);
router.get('/news/feed', auth, getPersonalizedFeed);
router.post('/news/ask', auth, askAI);

// Bookmarks
router.post('/bookmarks', auth, addBookmark);
router.get('/bookmarks', auth, getBookmarks);
router.delete('/bookmarks/:id', auth, removeBookmark);

// Likes
router.post('/likes/toggle', auth, toggleLike);
router.get('/likes', auth, getLikedArticles);

// Notifications
router.get('/notifications', auth, getNotifications);
router.put('/notifications/read', auth, markAllRead);
router.get('/notifications/unread-count', auth, getUnreadCount);

module.exports = router;