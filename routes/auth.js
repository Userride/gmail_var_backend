// // const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const bcrypt = require('bcryptjs');
// const crypto = require('crypto');
// const nodemailer = require('nodemailer');
// const jwt = require('jsonwebtoken');
// require('dotenv').config();

// const CLIENT_URL = process.env.CLIENT_URL;
// const SERVER_URL = process.env.SERVER_URL;

// // Nodemailer setup
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT || 587),
//   secure: false,
//   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
// });

// // ===== REGISTER =====
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password)
//       return res.status(400).json({ message: 'All fields are required' });

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: 'Email already registered' });

//     const hashed = await bcrypt.hash(password, 10);
//     const verifyToken = crypto.randomBytes(32).toString('hex');

//     const user = new User({ name, email, password: hashed, verifyToken });
//     await user.save();

//     const verifyLink = `${SERVER_URL}/api/auth/verify/${verifyToken}`;

//     await transporter.sendMail({
//       from: process.env.SMTP_FROM,
//       to: email,
//       subject: 'Verify your email',
//       html: `<p>Hi ${name},</p>
//              <p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
//     });

//     res.json({ message: 'Registered. Verification email sent.' });
//   } catch (err) {
//     console.error('Register error:', err);
//     if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // ===== VERIFY EMAIL =====
// router.get('/verify/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const user = await User.findOne({ verifyToken: token });
//     if (!user) return res.status(400).send('Invalid verification token');

//     user.isVerified = true;
//     user.verifyToken = undefined;
//     await user.save();

//     // Auto-login by generating JWT
//     const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     return res.redirect(`${CLIENT_URL}/login?token=${jwtToken}`);
//   } catch (err) {
//     console.error('Verify error:', err);
//     res.status(500).send('Server error');
//   }
// });

// // ===== LOGIN =====
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: 'Email and password required' });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: 'Invalid credentials' });
//     if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL;
const SERVER_URL = process.env.SERVER_URL;

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

// ===== REGISTER =====
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = new User({ name, email, password: hashed, verifyToken });
    await user.save();

    const verifyLink = `${SERVER_URL}/api/auth/verify/${verifyToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `<p>Hi ${name},</p>
             <p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
    });

    res.json({ message: 'Registered. Verification email sent.' });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== VERIFY EMAIL =====
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verifyToken: token });
    if (!user) return res.status(400).send('Invalid verification token');

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    // Auto-login by generating JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.redirect(`${CLIENT_URL}/login?token=${jwtToken}`);
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).send('Server error');
  }
});

// ===== LOGIN =====
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
