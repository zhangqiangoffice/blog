var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
  },
  title: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: {
      type: String,
      default: '',
  },
  addTime: {
      type: Date,
      default: new Date()
  },
  views: {
      type: Number,
      default: 0
  },
  content: {
      type: String,
      default: '',
  }
})