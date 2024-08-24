const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    // Set for 1 min
    windowMs: 60 * 1000,
    // Set limit for each IP to 20 requests
    max: 20,
    // Set the user-based rate limiting
    keyGenerator: (req) => req.body.user_id || req.ip,
    // Handler function
    handler: (req, res) => {
        res.status(429).send("Rate limit exceeded...");
    }
});

module.exports = rateLimiter;
