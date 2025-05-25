const express = require('express');
const router = express.Router();

router.get('/public-key', (req, res) => {
    res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

module.exports = router;