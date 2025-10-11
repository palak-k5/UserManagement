const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../config/db');

// Fetch and insert a user
router.post('/fetch', async (req, res) => {
  
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM users');
    const currentCount = countResult[0].count;

    if (currentCount >= 1000) {
      return res.status(200).json({
        success: true,
        message: `Table already has ${currentCount} records. Target of 1000 reached.`,
        currentCount,
        inserted: false
      });
    }

    console.log(`Current count: ${currentCount}/${1000}. Fetching one user...`);

    const maxAttempts = 10;
    let inserted = false;

    for (let attempts = 1; attempts <= maxAttempts; attempts++) {
      const response = await axios.get('https://randomuser.me/api/?results=1');
      const users = response.data.results;
      if (!users || users.length === 0) continue;

      const user = users[0];
      const uuid = user.login?.uuid || `${user.email}-${Date.now()}`;
      const name = user.name ? `${user.name.first} ${user.name.last}` : null;
      const email = user.email || null;
      const city = user.location?.city || null;

      if (!uuid || !name || !email || !city) continue;

      const [existing] = await pool.query('SELECT uuid FROM users WHERE uuid = ?', [uuid]);
      if (existing.length > 0) continue;

      await pool.query(
        'INSERT INTO users (uuid, name, email, city) VALUES (?, ?, ?, ?)',
        [uuid, name, email, city]
      );

      inserted = true;
      const newCount = currentCount + 1;
      return res.status(200).json({
        success: true,
        message: 'User inserted successfully',
        currentCount: newCount,
        targetCount,
        remaining: targetCount - newCount,
        inserted: true,
        user: { uuid, name, email, city }
      });
    }
    return res.status(500).json({
      success: false,
      message: `Failed to insert a unique user after ${maxAttempts} attempts`,
      currentCount,
      targetCount,
      inserted: false
    });
});
return res.status(500).json({
  success: false,
  message: `Failed to insert a unique user after ${maxAttempts} attempts`,
  currentCount,
  targetCount,
  inserted: false
});


// GET List all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT uuid, name, email, city FROM users ');
    
    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// PUT /api/users/:uuid - Update a user
router.put('/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, email, city } = req.body;

    if (!name || !email || !city) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and city are required'
      });
    }

    const [result] = await pool.query(
      'UPDATE users SET name = ?, email = ?, city = ? WHERE uuid = ?',
      [name, email, city, uuid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { uuid, name, email, city }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

module.exports = router;