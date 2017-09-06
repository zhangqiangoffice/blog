var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Category = require('../models/Category')

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

router.get('/category', (req, res) => {
  res.render('admin/category_index', {
    userInfo: req.userInfo,
    // users: users,
    // page: page,
    // count: count,
    // limit: limit,
    // pages: pages,
  })
})

router.get('/category/add', (req, res) => {
  res.render('admin/category_add', {
    userInfo: req.userInfo,
    // users: users,
    // page: page,
    // count: count,
    // limit: limit,
    // pages: pages,
  })
})

router.post('/category/add', (req, res) => {
  var name = req.body.name || ''
  if (name === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '名称不能为空！',
    })
    return
  }

  Category.findOne({name: name}).then(rs => {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类已经存在了！',
      })
      return Promise.reject()
    } else {
      return new Category({
        name: name
      }).save()
    }
  }).then(newCategory => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类保存成功！',
      url: '/admin/category'
    })
  })
})

module.exports = router
