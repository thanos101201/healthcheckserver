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
        type: Object
    },
    calorie: {
        type: Object
    },
    minuteId: {
        type: String
    },
    calId: {
        type: String
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;