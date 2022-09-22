const mongoose = require('mongoose')

const User = mongoose.model('User', {
    name: String,
    email: String,
    password: String,
    weight: Number,
    height: Number,
    birthDate: String,
})

module.exports = User