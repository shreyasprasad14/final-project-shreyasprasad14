const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username: {type: String, required: true},
        email: {type: String, required: true},
        password: {type: String, required: true},
        reputation: {type: Number, default: 0},
        account_date_time: {type: Date, default: Date.now}
    }
)

module.exports = mongoose.model('User', UserSchema);