module.exports = app => {
  app.use('/api', require('./api'))
  app.use('/dashboard', require('./dashboard'))
  app.use('/', require('./main'))
}
