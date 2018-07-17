var express = require('express')
var app = express()
var swig = require('swig')
var mongoose = require('mongoose')
var bodyParser = require('body-parser')
var cookies = require('cookies')
var User = require('./models/User')
const config = require('config-lite')(__dirname)

app.use('/public', express.static(__dirname + '/public'))
app.engine('html', swig.renderFile)
app.set('views', './views')
app.set('view engine', 'html')
app.use(bodyParser.urlencoded({extended: true}))
app.use((req, res, next) => {
  req.cookies = new cookies(req, res)
  req.userInfo = {}
  var cookiesUserInfo = req.cookies.get('userInfo')
  if (cookiesUserInfo) {
    try {
      req.userInfo = JSON.parse(cookiesUserInfo)

      User.findById(req.userInfo._id).then(userInfo => {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin)
        next()
      })
    } catch (e) {
      next()
    }
  } else {
    next()
  }
})

swig.setDefaults({cache: false})

app.use('/admin', require('./routers/admin'))
app.use('/api', require('./routers/api'))
app.use('/', require('./routers/main'))

mongoose.connect(config.mongodb, err => {
  if (err) {
    console.log('数据库连接失败')
  } else {
    console.log('数据库连接成功')
    app.listen(config.port, () => {
      console.log(`server is listening at ${config.port} ...`)
    })
  }
})
