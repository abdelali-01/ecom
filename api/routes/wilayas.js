const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const wilayasData = require('../utils/wilayasData');

// Get all wilayas
router.get('/', async (req, res) => {
    try {
        const [wilayas] = await pool.query('SELECT * FROM wilayas');
        
        // If no wilayas exist, create them from wilayasData
        if (wilayas.length === 0) {
            const defaultShippingPrices = {
                home: 1200,
                desk: 800
            };

            const wilayaEntries = Object.entries(wilayasData).map(([name, cities]) => ({
                name,
                cities: JSON.stringify(cities),
                shipping_prices: JSON.stringify(defaultShippingPrices),
                is_active: true
            }));

            await pool.query(
                'INSERT INTO wilayas (name, cities, shipping_prices, is_active) VALUES ?',
                [wilayaEntries.map(w => [w.name, w.cities, w.shipping_prices, w.is_active])]
            );

            const [newWilayas] = await pool.query('SELECT * FROM wilayas');
            return res.json(newWilayas);
        }

        res.json(wilayas);
    } catch (error) {
        console.error('Error fetching wilayas:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update wilaya shipping prices
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { shipping_prices, is_active } = req.body;

        const updateFields = [];
        const updateValues = [];

        if (shipping_prices) {
            updateFields.push('shipping_prices = ?');
            updateValues.push(JSON.stringify(shipping_prices));
        }

        if (typeof is_active === 'boolean') {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updateValues.push(id);

        await pool.query(
            `UPDATE wilayas SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        const [updatedWilaya] = await pool.query('SELECT * FROM wilayas WHERE id = ?', [id]);
        
        if (updatedWilaya.length === 0) {
            return res.status(404).json({ error: 'Wilaya not found' });
        }

        res.json(updatedWilaya[0]);
    } catch (error) {
        console.error('Error updating wilaya:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 