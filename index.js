const express = require('express')
const app = express()
const swig = require('swig')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const fileStreamRotator = require('file-stream-rotator')
const fs = require('fs')
const path = require('path')
const config = require('config-lite')(__dirname)
const routers = require('./routers')
const morgan = require('morgan')
const pkg = require('./package')

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

app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
    url: config.mongodb
  })
}))

app.use(bodyParser.urlencoded({extended: true}))

swig.setDefaults({cache: false})

// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

// 添加模板必需的三个变量
app.use((req, res, next) => {
  res.locals.user = req.session.user
  req.userInfo = req.session.user
  next()
})

// 路由
routers(app)

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
