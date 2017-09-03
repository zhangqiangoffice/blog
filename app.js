var express = require('express')
var app = express()
var swig = require('swig')

app.use('/public', express.static(__dirname + '/public'))
app.engine('html', swig.renderFile)
app.set('views', './views')
app.set('view engine', html)

swig.setDefaults({cache: false})



app.listen(8081, () => {
  console.log('server is listening at 8081 ...')
})