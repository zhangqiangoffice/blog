var express = require('express')
var router = express.Router()
var User = require('../models/User')

var responseData = {}

router.use( (req, res, next) => {
  responseData = {
    code: 0,
    message: '注册成功'
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

  User.findOne({username: username}).then( userInfo => {
    if (userInfo) {
      responseData.code = 4
      responseData.message =  '该用户名已存在'
      res.json(responseData)
      return
    }

    var user = new User({
      username: username,
      password: password
    })
    return user.save()
  }).then(newUserInfo => {
    console.log(newUserInfo)
    res.json(responseData) 
  })



})

module.exports = router