#i18n-light

##Installation

```bash
npm install i18n-light
```

##Motiviation
My main motivation in developing `i18n-light` was to create a localization module which enabled a developer to use the same storage (mentioned as `dictionaries`) for both `Back-end` and `Front-end` code, thus making localized phrases more consistent and organized.

##Usage
```javascript
var express = require('express')
  , app = express()

i18n.configure({
  dir: path.join(__dirname, 'dict'),
  defaultLocale: 'en',
  fallback: true,
  cache: true,
  extension: 'json',
  refresh: false
})

app.use(i18n.init())

app.get('/', function(req, res) {
  i18n.setLocale('en')
  res.send(i18n.__('hello'))
})

app.get('/it', function(req, res) {
  i18n.setLocale('it')
  res.send(i18n.__('hello'))
})

require('http').createServer(app).listen(8080)
```