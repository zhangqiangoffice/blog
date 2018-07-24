var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Content = require('../models/Content')

var responseData = {}

router.use((req, res, next) => {
  responseData = {
    code: 0,
    message: ''
  }
  next()
})

router.post('/user/register', (req, res, next) => {
  var username = req.body.username
  var password = req.body.password
  var repassword = req.body.repassword

  if (username === '') {
    responseData.code = 1
    responseData.message = '用户名不得为空'
    res.json(responseData)
    return
  }

  if (password === '') {
    responseData.code = 2
    responseData.message = '密码不得为空'
    res.json(responseData)
    return
  }

  if (password !== repassword) {
    responseData.code = 3
    responseData.message = '两次密码不一致'
    res.json(responseData)
    return
  }

  User.findOne({username: username}).then(userInfo => {
    if (userInfo) {
      responseData.code = 4
      responseData.message = '该用户名已存在'
      res.json(responseData)
      return
    }

    var user = new User({
      username: username,
      password: password
    })
    return user.save()
  }).then(newUserInfo => {
    responseData.message = '注册成功'
    res.json(responseData)
  })
})

router.post('/user/login', (req, res, next) => {
  var username = req.body.username
  var password = req.body.password

  if (username === '' || password === '') {
    responseData.code = 1
    responseData.message = '用户名或者密码不得为空'
    res.json(responseData)
    return
  }

  User.findOne({username: username, password: password}).then(userInfo => {
    if (!userInfo) {
      responseData.code = 2
      responseData.message = '用户名或者密码错误'
      res.json(responseData)
      return
    }
    responseData.message = '登录成功'

    responseData.userInfo = {
      _id: userInfo._id,
      username: userInfo.username
    }

    // 删除密码这种敏感信息，将用户信息存入 session
    const user = {
      _id: userInfo._id,
      username: userInfo.username,
      isAdmin: Boolean(userInfo.isAdmin)
    }
    req.session.user = user

    res.json(responseData)
  })
})

router.get('/user/logout', (req, res, next) => {
  // 清空 session 中用户信息
  req.session.user = null
  res.json(responseData)
})

router.get('/comment', (req, res) => {
  var contentId = req.query.contentid || ''

  Content.findOne({_id: contentId}).then(content => {
    responseData.comments = content.comments
    res.json(responseData)
  })
})

router.post('/comment/post', (req, res, next) => {
  var contentId = req.body.contentId || ''
  var postData = {
    username: req.userInfo.username,
    postTime: new Date(),
    content: req.body.content
  }

  Content.findOne({_id: contentId}).then(content => {
    content.comments.push(postData)
    return content.save()
  }).then(newContent => {
    responseData.message = '评论成功'
    responseData.comments = newContent.comments
    res.json(responseData)
  })
})

module.exports = router
