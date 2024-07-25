const jwt = require('jsonwebtoken');
const { appErr } = require('../utils/appErr');


const protectRoute = (req, res, next) => {
  let token;
  if (req.headers.authorization || req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_KEY);
      req.userAuth = decoded.id;
      next();
    } catch (error) {
      return next(appErr('Not authorized, token failed', 401));
    }
  } else {
    return next(appErr('Not authorized, no token', 401));
  }
};

module.exports = protectRoute;
