const express = require('express');
const cors = require('cors');
const user = require('../Router/user');
const app = express();
app.use(cors({
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
    ]
}));
app.get('/', (req, res) => {
    res.send('Welcome');
});
app.use('/user', (req, res) => {
    user(req, res);
})
app.listen(3001, () => {
    console.log("Server started!!!");
});