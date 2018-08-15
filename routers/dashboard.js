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

    Content.find().lean().sort({ _id: -1 }).limit(limit).skip(skip).populate(['category', 'user']).exec((err, result) => {
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

router.get('/category/add', (req, res) => {
  res.render('admin/category_add', {
    userInfo: req.userInfo
  })
})

router.post('/category/add', (req, res) => {
  var name = req.body.name || ''
  if (name === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '名称不能为空！'
    })
    return
  }

  Category.findOne({name: name}).then(rs => {
    if (rs) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类已经存在了！'
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

router.get('/category/edit', (req, res) => {
  var id = req.query.id || ''

  Category.findOne({_id: id}).then(category => {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在！'
      })
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category
      })
    }
  })
})

router.post('/category/edit', (req, res) => {
  var id = req.query.id || ''
  var name = req.body.name || ''

  if (name === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '名称不能为空！'
    })
    return
  }

  Category.findOne({_id: id}).then(category => {
    if (!category) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '分类信息不存在！'
      })
    } else {
      if (category.name === name) {
        res.render('admin/success', {
          userInfo: req.userInfo,
          message: '分类信息修改成功！',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        return Category.findOne({
          _id: {$ne: id},
          name: name
        })
      }
    }
  }).then(sameCategory => {
    if (sameCategory) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类了！'
      })
      return Promise.reject()
    } else {
      return Category.update({
        _id: id
      }, {
        name: name
      })
    }
  }).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类信息修改成功！',
      url: '/admin/category'
    })
  })
})

router.get('/category/delete', (req, res) => {
  var id = req.query.id || ''

  Category.remove({_id: id}).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '分类删除成功'
    })
  })
})

router.get('/content', (req, res) => {
  var page = Number(req.query.page) || 1
  var limit = 10
  var pages = 0

  Content.count().then(count => {
    pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit

    Content.find().sort({_id: -1}).limit(limit).skip(skip).populate(['category', 'user']).then(contents => {
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        page: page,
        count: count,
        limit: limit,
        pages: pages
      })
    })
  })
})

router.get('/content/add', (req, res) => {
  Category.find().then(categories => {
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories
    })
  })
})

router.post('/content/add', (req, res) => {
  if (req.body.category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容分类不能为空！'
    })
  }

  if (req.body.category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容标题不能为空！'
    })
  }

  new Content({
    category: req.body.category,
    title: req.body.title,
    user: req.userInfo._id.toString(),
    description: req.body.description,
    content: req.body.content
  }).save().then(rs => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容保存成功！',
      url: '/admin/content'
    })
  })
})

router.get('/content/edit', (req, res) => {
  var id = req.query.id || ''
  var categories = []

  Category.find().then(rs => {
    categories = rs
    return Content.findOne({_id: id}).populate('category')
  }).then(content => {
    if (!content) {
      res.render('admin/error', {
        userInfo: req.userInfo,
        message: '指定内容不存在！'
      })
    } else {
      res.render('admin/content_edit', {
        userInfo: req.userInfo,
        content: content,
        categories: categories
      })
    }
  })
})

router.post('/content/edit', (req, res) => {
  var id = req.query.id || ''

  if (id === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容ID不能为空！'
    })
  }

  if (req.body.category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容分类不能为空！'
    })
  }

  if (req.body.category === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容标题不能为空！'
    })
  }

  Content.update({
    _id: id
  }, {
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
    addTime: new Date()
  }).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容修改成功！',
      url: '/admin/content'
    })
  })
})

router.get('/content/delete', (req, res) => {
  var id = req.query.id || ''

  if (id === '') {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容ID不能为空！'
    })
  }

  Content.remove({_id: id}).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容删除成功'
    })
  })
})

module.exports = router
