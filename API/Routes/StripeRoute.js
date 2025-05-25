const express = require('express');
const router = express.Router();
const { publicKey } = require('../config/stripe');

router.get('/public-key', (req, res) => {
    try {
        if (!publicKey) {
            console.error('Stripe public key not configured');
            return res.status(500).json({ 
                message: 'Stripe public key not configured' 
            });
        }
        
        // Log the public key (remove in production)
        console.log('Sending public key:', publicKey);
        
        res.json({ publicKey });
    } catch (error) {
        console.error('Error getting Stripe public key:', error);
        res.status(500).json({ 
            message: 'Error getting Stripe public key' 
        });
    }
});

module.exports = router;