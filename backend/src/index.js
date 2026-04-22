require('dotenv').config();
const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const initDB = require('./db/init');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

app.use('/api', routes);

app.get('/', (req, res) => res.json({ message: 'NewsNest API is running 🚀' }));

const PORT = process.env.PORT || 5000;

initDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});