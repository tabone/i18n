'use strict'

var express = require('express')
  , app = express()
  , path = require('path')
  , i18n = require('../index')
  , locale = ['en', 'it']
  , port = 8080

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/css', express.static(path.join(__dirname, 'dist/css')))
app.use('/js', express.static(path.join(__dirname, 'dist/js')))

i18n.configure({
  dir: path.join(__dirname, 'dict'),
  defaultLocale: 'en',
  fallback: true,
  cache: true,
  extension: 'json',
  refresh: false
})

app.use(i18n.init())

app.get('/', function(req, res, next) {
  i18n.setLocale('en')
  res.render('index')
})

app.get('/it', function(req, res, next) {
  i18n.setLocale('it')
  res.render('index')
})

app.use(function(req, res) {
})

require('http').createServer(app).listen(port, function() {
  console.log('listening on ' + port)
})
