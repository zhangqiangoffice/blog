const express = require('express')
const app = express()
const swig = require('swig')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookies = require('cookies')
const User = require('./models/User')
const fileStreamRotator = require('file-stream-rotator')
const fs = require('fs')
const path = require('path')
const config = require('config-lite')(__dirname)
const morgan = require('morgan')

const logDirectory = path.join(__dirname, 'log')

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

// create a rotating write stream
const accessLogStream = fileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory, 'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false
})

app.use('/public', express.static(path.join(__dirname, 'public')))
app.engine('html', swig.renderFile)
app.set('views', './views')
app.set('view engine', 'html')

app.use(morgan('combined', { stream: accessLogStream }))

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
