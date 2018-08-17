var express = require('express')
var router = express.Router()
var Category = require('../models/Category')
var Content = require('../models/Content')
const marked = require('marked')
const moment = require('moment')

var data

const formatDate = dateStr => {
  return dateStr ? moment(dateStr).format('YYYY年M月D日 HH:mm:ss') : ''
}

router.use((req, res, next) => {
  data = {
    userInfo: req.userInfo,
    categories: []
  }

  data.formatDate = formatDate
  data.marked = marked

  Category.find().then(categories => {
    data.categories = categories
    next()
  })
})

router.get('/', (req, res, next) => {
  const category = req.query.category || ''
  data.category = category
  data.count = 0
  data.page = Number(req.query.page || 1)
  data.limit = 10
  data.pages = 0

  var where = {}
  if (category) {
    where.category = category
  }

  Content.where(where).estimatedDocumentCount().then(count => {
    data.count = count
    data.pages = Math.ceil(count / data.limit)
    data.page = Math.min(data.page, data.pages)
    data.page = Math.max(data.page, 1)
    var skip = (data.page - 1) * data.limit

    return Content.where(where).find().sort({addTime: -1}).limit(data.limit).skip(skip).populate(['author'])
  }).then((contents) => {
    data.contents = contents
    res.render('main/index', data)
  })
})

router.get('/view', (req, res) => {
  var contentId = req.query.contentid || ''

  Content.findOne({ _id: contentId }).populate('author').then(result => {
    const { category } = result
    data.content = result
    data.category = category
    result.views++
    result.save()

    Promise.all([Content.findOne({ '_id': { '$gt': contentId }, category }).sort({ addTime: -1 }).exec(), Content.findOne({ '_id': { '$lt': contentId }, category }).sort({ addTime: -1 }).exec()])
      .then(([prevOne, nextOne]) => {
        data.prev = prevOne
        data.next = nextOne
        res.render('main/view', data)
      })
  })
})

module.exports = router
