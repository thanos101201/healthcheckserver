const express = require('express');

const router = express.Router();

router.get('/points', (req, res) => {
    get('req, res');
});

router.get('/url', (req, res) => {
    url(req, res);
});

module.exports = router;