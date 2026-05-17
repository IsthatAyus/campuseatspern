const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid Authorization format' });
  const token = parts[1];
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret';
    req.user = jwt.verify(token, secret);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
