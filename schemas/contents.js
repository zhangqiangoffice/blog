var mongoose = require('mongoose')

module.exports = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  title: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    default: ''
  },
  addTime: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  content: {
    type: String,
    default: ''
  },
  comments: {
    type: Array,
    default: []
  }
}, { usePushEach: true })
