const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('./db');
const bcrypt = require('bcryptjs');

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const [rows] = await pool.query('SELECT * FROM accounts WHERE email = ?', [email]);
      if (rows.length === 0) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      const user = rows[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts WHERE id = ?', [id]);
    if (rows.length > 0) {
        done(null, rows[0]);
    } else {
        done(new Error('User not found'));
    }
  } catch (err) {
    done(err);
  }
});

module.exports = passport; 