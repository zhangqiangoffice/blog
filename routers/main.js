var express = require('express')
var router = express.Router()
var Category = require('../models/Category')
var Content = require('../models/Content')

var data

router.use((req, res, next) => {
  data = {
    userInfo: req.userInfo,
    categories: [],
  }
  
  Category.find().then(categories => {
    data.categories = categories
    next()
  })
})

router.get('/', (req, res, next) => {
  
  data.category = req.query.category || ''
  data.count = 0
  data.page = Number(req.query.page || 1)
  data.limit = 10
  data.pages = 0

  var where = {}
  if (data.category) {
    where.category = data.category
  }
  
  Content.where(where).count().then(count => {
    data.count = count
    data.pages = Math.ceil(count / data.limit)
    data.page = Math.min(data.page, data.pages)
    data.page = Math.max(data.page, 1)
    var skip = (data.page - 1) * data.limit
    
    return Content.where(where).find().sort({_id: -1}).limit(data.limit).skip(skip).populate(['category', 'user']).sort({addTime: -1})
  }).then((contents)=> {
    data.contents = contents
    res.render('main/index', data)
  })
})

router.get('/view', (req, res) => {
  var contentId = req.query.contentid || ''

  Content.findOne({_id: contentId}).then(content => {
    data.content = content

    content.views++
    content.save()
    
    res.render('main/view', data)
  })
})

module.exports = router
