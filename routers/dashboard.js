var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Content')

const calcPage = (page = 1, total, limit) => {
  const pages = Math.ceil(total / limit) || 0
  page = Math.min(page, pages)
  page = Math.max(page, 1)
  return page
}

const handleError = err => {
  return {
    code: 99,
    message: err.toString()
  }
}

const calcSkip = (page, limit) => (page - 1) * limit

let responseData = {}

router.use((req, res, next) => {
  responseData = {
    code: 0,
    message: '成功'
  }
  next()
})

router.use((req, res, next) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    res.statusCode = 403
    responseData.code = 1
    responseData.message = '对不起，只有管理员才可以进入后台管理'
    res.json(responseData)
    return
  }
  next()
})

router.param('user_id', function (req, res, next, id) {
  req.user = {
    id
  }
  next()
})

router.param('category_id', function (req, res, next, id) {
  req.category = {
    id
  }
  next()
})

router.param('content_id', function (req, res, next, id) {
  req.content = {
    id
  }
  next()
})

router.get('/', (req, res, next) => {
  res.render('dashboard/index')
})

router.get('/users', (req, res, next) => {
  let page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  User.estimatedDocumentCount().then(total => {
    page = calcPage(page, total, limit)
    const skip = calcSkip(page, limit)

    User.find({}, { password: 0 }).lean().limit(limit).skip(skip).then(users => {
      res.json({ ...responseData, list: users, total, page, limit })
    })
  })
})

router.delete('/users/:user_id', (req, res, next) => {
  var id = req.user.id || ''

  User.remove({ _id: id }).then(() => {
    res.json(responseData)
  })
})

router.get('/categories', (req, res) => {
  let page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  Category.estimatedDocumentCount().then(total => {
    page = calcPage(page, total, limit)
    const skip = calcSkip(page, limit)

    Category.find().lean().sort({_id: -1}).limit(limit).skip(skip).then(categories => {
      res.json({ ...responseData, list: categories, total, page, limit })
    })
  })
})

router.delete('/categories/:category_id', (req, res) => {
  var id = req.category.id || ''

  Category.remove({ _id: id }).then(() => {
    res.json(responseData)
  })
})

router.put('/categories/:category_id', (req, res) => {
  var id = req.category.id || ''
  var name = req.body.name || ''

  if (name === '') {
    responseData.code = 1
    responseData.message = '分类名称不能为空！'
    res.json(responseData)
  }

  Category.findOne({ _id: id }, (err, result) => {
    if (err) {
      res.json(handleError(err))
    }
    if (!result) {
      responseData.code = 2
      responseData.message = '分类信息不存在！'
      res.json(responseData)
    } else {
      Category.findOne({ _id: { $ne: id }, name: name }, (err, result) => {
        if (err) {
          res.json(handleError(err))
        }
        if (result) {
          responseData.code = 3
          responseData.message = '数据库中已经存在同名分类了！'
          res.json(responseData)
        } else {
          Category.update({ _id: id }, { name: name }, (err, result) => {
            if (err) {
              res.json(handleError(err))
            }
            res.json(responseData)
          })
        }
      })
    }
  })
})

router.post('/categories', (req, res) => {
  var name = req.body.name || ''

  if (name === '') {
    responseData.code = 1
    responseData.message = '分类名称不能为空！'
    res.json(responseData)
  }

  Category.findOne({ name: name }, (err, result) => {
    if (err) res.json(handleError(err))
    if (result) {
      responseData.code = 2
      responseData.message = '分类已经存在！'
      res.json(responseData)
    } else {
      new Category({ name: name }).save((err, result) => {
        if (err) res.json(handleError(err))
        responseData.category = result
        res.json(responseData)
      })
    }
  })
})

router.get('/contents', (req, res) => {
  let page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  Content.estimatedDocumentCount().then(total => {
    page = calcPage(page, total, limit)
    const skip = calcSkip(page, limit)

    Content.find().lean().sort({ _id: -1 }).limit(limit).skip(skip).populate(['category', 'author']).exec((err, result) => {
      if (err) res.json(handleError(err))
      res.json({ ...responseData, list: result, total, page, limit })
    })
  })
})

router.delete('/contents/:content_id', (req, res) => {
  var id = req.content.id || ''

  Content.deleteOne({ _id: id }, (err, result) => {
    if (err) res.json(handleError(err))
    res.json(responseData)
  })
})

router.post('/contents', (req, res) => {
  const { category, title, description, content } = req.body

  if (!category || !title || !description || !content) {
    responseData.code = 1
    responseData.message = '文章内容字段不全'
    res.json(responseData)
  }

  new Content({
    category,
    title,
    description,
    content,
    author: req.session.user._id.toString(),
    addTime: new Date()
  }).save((err, result) => {
    if (err) res.json(handleError(err))
    res.json(responseData)
  })
})

router.put('/contents/:content_id', (req, res) => {
  const id = req.content.id || ''
  const { category, title, description, content } = req.body

  if (!category || !title || !description || !content) {
    responseData.code = 1
    responseData.message = '文章内容字段不全'
    res.json(responseData)
  }

  Content.findOne({ _id: id }, (err, result) => {
    if (err) {
      res.json(handleError(err))
    }
    if (!result) {
      responseData.code = 2
      responseData.message = '文章不存在！'
      res.json(responseData)
    } else {
      Content.update({ _id: id }, { category, title, description, content, addTime: new Date() }, (err, result) => {
        if (err) {
          res.json(handleError(err))
        }
        res.json(responseData)
      })
    }
  })
})

module.exports = router
