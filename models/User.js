
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: String,
    email: {
        type: String,
        unique: true,
    },
    password: String
})

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;