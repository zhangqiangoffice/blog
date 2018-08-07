var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  username: String,
  password: String,
  registerDate: Date,
  isAdmin: {
    type: Boolean,
    default: false
  }
})
