const express = require('express');

const router = express.Router();
const url = require('../Controllers/user/url');
const get = require('../Controllers/user/get');
const fetchData = require('../Controllers/user/fetchData');
router.get('/points', (req, res) => {
    // get('req, res');
    fetchData(req, res);
});

router.get('/url', (req, res) => {
    console.log("Hello");
    url(req, res);
});
router.get('/', (req, res) => {
    get(req, res);
})
module.exports = router;