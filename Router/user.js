const express = require('express');

const router = express.Router();
const url = require('../Controllers/user/url');
const get = require('../Controllers/user/get');
router.get('/points', (req, res) => {
    get('req, res');
});

router.get('/url', (req, res) => {
    console.log("Hello");
    url(req, res);
});

module.exports = router;