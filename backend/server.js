const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

const migrations = fs.readFileSync(path.join(__dirname, 'migrations.sql'), 'utf8');
migrations.split(';').forEach(s => { if (s.trim()) db.exec(s); });

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'missing' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?,?)');
    const info = stmt.run(username, hash);
    const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET);
    res.json({ token, username });
  } catch (e) {
    res.status(400).json({ error: 'user_exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ id: row.id, username: row.username }, JWT_SECRET);
  res.json({ token, username: row.username });
});

function auth(req, res, next) {
  const authh = req.headers.authorization;
  if (!authh) return res.status(401).json({ error: 'noauth' });
  const token = authh.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data; next();
  } catch (e) { res.status(401).json({ error: 'invalid' }); }
}

app.post('/api/posts', auth, upload.single('image'), (req, res) => {
  const text = req.body.text || null;
  const image_path = req.file ? `/uploads/${req.file.filename}` : null;
  const stmt = db.prepare('INSERT INTO posts (user_id, text, image_path) VALUES (?,?,?)');
  const info = stmt.run(req.user.id, text, image_path);
  const post = db.prepare('SELECT p.*, u.username FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?').get(info.lastInsertRowid);
  res.json(post);
});

app.get('/api/posts', (req, res) => {
  const rows = db.prepare('SELECT p.*, u.username FROM posts p JOIN users u ON u.id = p.user_id ORDER BY p.created_at DESC LIMIT 100').all();
  res.json(rows);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Server running on', PORT));