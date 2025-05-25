const Stripe = require('stripe');
require('dotenv').config();

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not defined in environment variables');
}

if (!process.env.STRIPE_PUBLIC_KEY) {
    console.error('STRIPE_PUBLIC_KEY is not defined in environment variables');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = {
    stripe,
    publicKey: process.env.STRIPE_PUBLIC_KEY
};
