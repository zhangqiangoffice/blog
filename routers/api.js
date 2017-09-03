var express = require('express')
var router = express.Router()

router.get('/user', (req, res, next) => {
  res.send('user')
})

module.exports = router
