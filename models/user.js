const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    minutes: {
        type: String,
        required: true
    },
    steps: {
        type: String,
        required: true
    }
})