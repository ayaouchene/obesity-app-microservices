const jwt = require('jsonwebtoken');
//hiba-ahlem
  module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Aucun token fourni' });
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Contient userId et role
      next();
    } catch (error) {
      res.status(401).json({ message: 'Token invalide' });
    }
  };