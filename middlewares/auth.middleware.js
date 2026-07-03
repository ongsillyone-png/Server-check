/**
 * Middleware to check if user is logged in
 */
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    // Make user profile available in all EJS templates
    res.locals.user = req.session.user;
    return next();
  }
  // Redirect to login page if unauthorized
  res.redirect('/auth/login');
};

/**
 * Middleware to restrict access based on roles
 * @param {Array<string>} roles - List of allowed roles
 */
const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.redirect('/auth/login');
    }
    
    const userRole = req.session.user.role;
    if (roles.includes(userRole)) {
      return next();
    }
    
    // Forbidden if role not authorized
    res.status(403).render('errors/403', {
      title: 'Access Denied',
      layout: false // Do not use standard layout for error page
    });
  };
};

module.exports = {
  requireLogin,
  requireRole
};
