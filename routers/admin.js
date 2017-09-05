var express = require('express')
var router = express.Router()
var User = require('../models/User')

router.use((req, res, next) => {

  if (!req.userInfo.isAdmin) {
    res.send('对不起，只有管理员才可以进入后台管理')
    return
  }
  next()
})


router.get('/', (req, res, next) => {
  res.render('admin/index',{
    userInfo: req.userInfo
  })
})

router.get('/user', (req, res, next) => {
  
  var page = Number(req.query.page) || 1
  var limit = 10
  var pages = 0
  
  User.count().then(count => {
    
    pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    
    User.find().limit(limit).skip(skip).then(users => {
      res.render('admin/user_index', {
        userInfo: req.userInfo,
        users: users,
        page: page,
        count: count,
        limit: limit,
        pages: pages,
      })
    })
  })
  
  
})

module.exports = router
