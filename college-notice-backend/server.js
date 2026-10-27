
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200'
  ],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET || !ADMIN_PASSWORD) {
  console.error(
    'Missing JWT_SECRET or ADMIN_PASSWORD in your backend .env file.'
  );
  process.exit(1);
}

// Demo data: stored in memory and reset when the server restarts.
const students = [];
let nextStudentId = 1;

let notices = [
  {
    id: 1,
    title: 'Examination Announcement',
    category: 'Examination',
    date: '2026-11-05',
    details: 'Check the official examination timetable.'
  },
  {
    id: 2,
    title: 'Campus Events',
    category: 'Events',
    date: '2026-11-10',
    details: 'Check college communications for upcoming activities.'
  }
];

function createToken(payload) {
  const jwt = require('jsonwebtoken');

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '2h'
  });
}

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';

  if (!token) {
    return res.status(401).json({
      message: 'Please log in first.'
    });
  }

  try {
    req.user = require('jsonwebtoken').verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({
      message: 'Your session is invalid or expired. Please log in again.'
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Administrator access is required.'
    });
  }

  next();
}

// API status
app.get('/', (req, res) => {
  res.send('College Notice Service API is running.');
});

// Get notices
app.get('/api/notices', (req, res) => {
  res.json(notices);
});

// Student registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    password.length < 6
  ) {
    return res.status(400).json({
      message: 'Enter your name, a valid email, and a password of at least 6 characters.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (students.some(student => student.email === normalizedEmail)) {
    return res.status(409).json({
      message: 'This email is already registered. Please log in.'
    });
  }

  const student = {
    id: nextStudentId++,
    name: name.trim(),
    email: normalizedEmail,
    // Demo only: never store plain-text passwords in production.
    password
  };

  students.push(student);

  return res.status(201).json({
    message: 'Registration successful. Please log in.'
  });
});

// Student login
app.post('/api/auth/student-login', (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      message: 'Email and password are required.'
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const student = students.find(
    item =>
      item.email === normalizedEmail &&
      item.password === password
  );

  if (!student) {
    return res.status(401).json({
      message: 'Student not found or password is incorrect. Register first.'
    });
  }

  const token = createToken({
    id: student.id,
    email: student.email,
    role: 'student'
  });

  return res.json({
    message: 'Student login successful.',
    token,
    role: 'student',
    user: {
      name: student.name,
      role: 'student'
    }
  });
});

// Administrator login
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      message: 'Username and password are required.'
    });
  }

  const validUsername =
    username.trim() === ADMIN_USERNAME;

  const validPassword =
    password === ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return res.status(401).json({
      message: 'Invalid administrator username or password.'
    });
  }

  const token = createToken({
    username: ADMIN_USERNAME,
    role: 'admin'
  });

  return res.json({
    message: 'Administrator login successful.',
    token,
    role: 'admin',
    user: {
      username: ADMIN_USERNAME,
      role: 'admin'
    }
  });
});

// Add a notice (administrator only)
app.post(
  '/api/notices',
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { title, category, date, details, description } =
      req.body || {};

    if (
      typeof title !== 'string' ||
      !title.trim() ||
      typeof category !== 'string' ||
      !category.trim()
    ) {
      return res.status(400).json({
        message: 'Notice title and category are required.'
      });
    }

    const notice = {
      id: notices.length
        ? Math.max(...notices.map(item => Number(item.id) || 0)) + 1
        : 1,
      title: title.trim(),
      category: category.trim(),
      date: typeof date === 'string' ? date : '',
      details: typeof details === 'string'
        ? details
        : typeof description === 'string' ? description : ''
    };

    notices.push(notice);
    return res.status(201).json(notice);
  }
);

// Delete a notice (administrator only)
app.delete(
  '/api/notices/:id',
  requireAuth,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    const index = notices.findIndex(item => Number(item.id) === id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Notice not found.'
      });
    }

    notices.splice(index, 1);
    return res.json({
      message: 'Notice deleted successfully.'
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`College Notice Service backend running on port ${PORT}`);
});
