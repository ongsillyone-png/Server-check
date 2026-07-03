const UserRepository = require('../repositories/user.repository');
const crypto = require('crypto');

class AuthController {
  // GET /auth/login
  static showLogin(req, res) {
    res.render('auth/login', { 
      title: 'Login - Server Check System',
      error: req.query.error || null 
    });
  }

  // POST /auth/login
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.render('auth/login', {
          title: 'Login - Server Check System',
          error: 'Please fill in all fields.'
        });
      }

      // Look up user
      const user = await UserRepository.findByUsername(username);
      if (!user) {
        return res.render('auth/login', {
          title: 'Login - Server Check System',
          error: 'Invalid username or password.'
        });
      }

      // Hash input password to compare with database
      const hashedInput = crypto.createHash('sha256').update(password).digest('hex');
      
      // Compare hashes
      if (hashedInput === user.password_hash) {
        // Set user details in session
        req.session.user = {
          id: Number(user.id),
          username: user.username,
          role: user.role_name, // e.g. "System Administrator"
          name: user.name,
          email: user.email
        };
        
        return res.redirect('/dashboard');
      } else {
        return res.render('auth/login', {
          title: 'Login - Server Check System',
          error: 'Invalid username or password.'
        });
      }
    } catch (err) {
      next(err);
    }
  }

  // POST /auth/logout
  static logout(req, res, next) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/auth/login');
    });
  }
}

module.exports = AuthController;
