const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();
const pool = require('../config/db');
const { sendEmail } = require('../config/email');
const crypto = require('crypto');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to check for specific roles
const hasRole = (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
        return next();
    }
    res.status(403).json({ message: 'Forbidden' });
};

// Register a new user
router.post('/register', isAuthenticated, hasRole(['super']), async (req, res) => {
    const { username, email, password, role, phone } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO accounts (username, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, role, phone]
        );
        res.status(201).json({ id: result.insertId, message: 'Account created successfully' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Error creating account', error: error.message });
    }
});

// Login
router.post('/login', (req, res, next) => {
    console.log('Login attempt:', { email: req.body.email });
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Passport error:', err);
            return res.status(500).json({ message: 'Authentication error' });
        }
        if (!user) {
            console.log('Authentication failed:', info.message);
            return res.status(401).json({ message: info.message });
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ message: 'Login error' });
            }
            console.log('User logged in successfully:', user.email);
            res.json({ user: req.user, message: 'Logged in successfully' });
        });
    })(req, res, next);
});

// Logout
router.post('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.json({ message: 'Logged out successfully' });
    });
});

// Check auth status
router.get('/me', isAuthenticated, (req, res) => {
    res.json({ user: req.user });
});

// Get all admin accounts
router.get('/admins', isAuthenticated, hasRole(['super', 'sub-super']), async (req, res) => {
    try {
        const [admins] = await pool.query(
            'SELECT id, username, email, role, phone, created_at, updated_at FROM accounts WHERE role IN ("super", "sub-super", "manager") ORDER BY created_at DESC'
        );
        res.json({ admins });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Error fetching admins', error: error.message });
    }
});

// Delete an account
router.delete('/:id', isAuthenticated, hasRole(['super']), async (req, res) => {
    const { id } = req.params;
    
    try {
        // Check if the account exists
        const [account] = await pool.query('SELECT id, role FROM accounts WHERE id = ?', [id]);
        
        if (account.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        // Prevent super admin from deleting themselves
        if (account[0].id === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        
        // Delete the account
        await pool.query('DELETE FROM accounts WHERE id = ?', [id]);
        
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
});

// Update an account
router.put('/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { username, email, phone, password, role } = req.body;
    console.log(req.body)
    
    try {
        // Check if the account exists
        const [account] = await pool.query('SELECT id, role FROM accounts WHERE id = ?', [id]);
        
        if (account.length === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        
        const targetAccount = account[0];
        const currentUser = req.user;
        
        // Check permissions based on roles
        let canUpdate = false;
        let canUpdateRole = false;
        
        // Super admin can update sub-super and manager, and update their roles
        if (currentUser.role === 'super') {
            if (targetAccount.role === 'sub-super' || targetAccount.role === 'manager') {
                canUpdate = true;
                canUpdateRole = true;
            }
            // Super admin can also update other super admins
            else if (targetAccount.role === 'super') {
                canUpdate = true;
                canUpdateRole = true;
            }
        }
        // Sub-super can update manager and update their role
        else if (currentUser.role === 'sub-super') {
            if (targetAccount.role === 'manager') {
                canUpdate = true;
                canUpdateRole = true;
            }
        }
        
        // Users can always update their own account (except role)
        if (currentUser.id === targetAccount.id) {
            canUpdate = true;
            canUpdateRole = false; // Users cannot update their own role
        }
        
        if (!canUpdate) {
            return res.status(403).json({ 
                message: 'You do not have permission to update this account' 
            });
        }
        
        // Build update query dynamically
        let updateFields = [];
        let updateValues = [];
        
        if (username !== undefined) {
            updateFields.push('username = ?');
            updateValues.push(username);
        }
        
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(phone);
        }
        
        if (password !== undefined) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        
        // Only allow role update if user has permission
        if (role !== undefined && canUpdateRole) {
            // Validate role
            const validRoles = ['super', 'sub-super', 'manager'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
            
            // Prevent downgrading super admin
            if (targetAccount.role === 'super' && role !== 'super') {
                return res.status(400).json({ 
                    message: 'Cannot downgrade super admin role' 
                });
            }
            
            updateFields.push('role = ?');
            updateValues.push(role);
        } else if (role !== undefined && !canUpdateRole) {
            if(currentUser.role !== role){
                return res.status(403).json({ 
                    message: 'You do not have permission to update roles' 
                });
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        // Add the account ID to the values array
        updateValues.push(id);
        
        // Execute update
        await pool.query(
            `UPDATE accounts SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        res.json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Error updating account', error: error.message });
    }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
    
    try {
        // Check if user exists
        const [users] = await pool.query('SELECT id, email FROM accounts WHERE email = ?', [email]);
        
        if (users.length === 0) {
            // Don't reveal if email exists or not for security
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }
        
        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        
        // Store reset token in database
        await pool.query(
            'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
            [email, resetToken, expiresAt]
        );
        
        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
        
        // Send email
        const emailResult = await sendEmail(email, 'passwordReset', [resetToken, resetUrl]);
        
        if (emailResult.success) {
            res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        } else {
            console.error('Failed to send email:', emailResult.error);
            res.status(500).json({ message: 'Error sending password reset email' });
        }
        
    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Error processing password reset request' });
    }
});

// Verify reset token
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    
    try {
        // Check if token exists and is valid
        const [tokens] = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE',
            [token]
        );
        
        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        res.json({ message: 'Token is valid', email: tokens[0].email });
        
    } catch (error) {
        console.error('Error verifying reset token:', error);
        res.status(500).json({ message: 'Error verifying reset token' });
    }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    try {
        // Check if token exists and is valid
        const [tokens] = await pool.query(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE',
            [token]
        );
        
        if (tokens.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }
        
        const resetToken = tokens[0];
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Update user password
        await pool.query(
            'UPDATE accounts SET password = ? WHERE email = ?',
            [hashedPassword, resetToken.email]
        );
        
        // Mark token as used
        await pool.query(
            'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
            [token]
        );
        
        // Send success email
        await sendEmail(resetToken.email, 'passwordResetSuccess', [resetToken.email]);
        
        res.json({ message: 'Password reset successfully' });
        
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Clean up expired tokens (optional - can be run as a cron job)
router.post('/cleanup-expired-tokens', async (req, res) => {
    try {
        await pool.query('DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE');
        res.json({ message: 'Expired tokens cleaned up successfully' });
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
        res.status(500).json({ message: 'Error cleaning up tokens' });
    }
});



module.exports = router; 