module.exports = app => {
  app.use('/admin', require('./admin'))
  app.use('/api', require('./api'))
  app.use('/', require('./main'))
}
