var express = require('express')
var router = express.Router()
var User = require('../models/User')
var Category = require('../models/Category')
var Content = require('../models/Content')


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
  
  var page = Number(req.query.page) || 1
  var limit = 10
  var pages = 0
  
  Category.count().then(count => {
    
    pages = Math.ceil(count / limit)
    page = Math.min(page, pages)
    page = Math.max(page, 1)
    var skip = (page - 1) * limit
    
    Category.find().sort({_id: -1}).limit(limit).skip(skip).then(categories => {
      res.render('admin/category_index', {
        userInfo: req.userInfo,
        categories: categories,
        page: page,
        count: count,
        limit: limit,
        pages: pages,
      })
    })
  })
})

router.get('/category/add', (req, res) => {
  res.render('admin/category_add', {
    userInfo: req.userInfo,
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

router.get('/category/edit', (req, res) => {
  var id = req.query.id || ''

  Category.findOne({_id: id}).then(category => {
    if (!category) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '分类信息不存在！'
      })
    } else {
      res.render('admin/category_edit', {
        userInfo: req.userInfo,
        category: category,
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
      message: '名称不能为空！',
    })
    return
  }

  Category.findOne({_id: id}).then(category => {

    if (!category) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '分类信息不存在！'
      })
    } else {
      if (category.name === name) {
        res.render('admin/success',{
          userInfo: req.userInfo,
          message: '分类信息修改成功！',
          url: '/admin/category'
        })
        return Promise.reject()
      } else {
        return Category.findOne({
          _id: {$ne: id},
          name: name,
        })
      }
    }
  }).then(sameCategory => {
    if (sameCategory) {
      res.render('admin/error',{
        userInfo: req.userInfo,
        message: '数据库中已经存在同名分类了！'
      })
      return Promise.reject()
    } else {

      return Category.update({
        _id: id
      },{
        name: name
      })
    }
  }).then(() => {
    res.render('admin/success',{
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
      message: '分类删除成功',
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
    
    Content.find().sort({_id: -1}).limit(limit).skip(skip).populate('category').then(contents => {
      res.render('admin/content_index', {
        userInfo: req.userInfo,
        contents: contents,
        page: page,
        count: count,
        limit: limit,
        pages: pages,
      })
    })
  })
})

router.get('/content/add', (req, res) => {
  
  Category.find().then(categories => {
    
    res.render('admin/content_add', {
      userInfo: req.userInfo,
      categories: categories,
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
    description: req.body.description,
    content: req.body.content,
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
      res.render('admin/error',{
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

  if (id === '' ) {
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
    _id: id,
  },{
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    content: req.body.content,
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

  if (id === '' ) {
    res.render('admin/error', {
      userInfo: req.userInfo,
      message: '内容ID不能为空！'
    })
  }

  Content.remove({_id: id}).then(() => {
    res.render('admin/success', {
      userInfo: req.userInfo,
      message: '内容删除成功',
    })
  })
})

module.exports = router
