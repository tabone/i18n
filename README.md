# i18n
Lightweight NodeJS Internationalization Middleware

# Installation

    npm install --save i18n-light

# Usage

    var express = require('express')
      , path = require('path')
      , i18n = require('i18n-light')
      , app = module.exports = express()
    
    i18n.configure({
      defaultLocale: 'en',
      dir: path.join(__dirname, 'locale'),
      fallback: true
    })
    
    app.use(i18n.init())
    
    app.get('/', function(req, res) {
      res.i18n.__('hello')
    })
    
    app.get('/italian', function(req, res) {
      res.setLocale('it')
      res.i18n.__('hello')
    })
    
    require('http').createServer(app).listen(8080)

## Explaination

### .configure
As one can see the only configurations which `i18n-light` needs are three things:

| Config Keyword | Type | Description |
|----------------|------|-------------|
| `defaultLocale` | String | The locale which will be considered as current locale when i18n is configured. This is also the locale which will be used as a fallback for any keywords which are not found in the dictionary locale being used. |
| `dir` | String | This is the directory where `i18n-light` will look for locale specific dictionaries. |
| `fallback` | Boolean  | Indicates whether to use the default locale as a fallback when a keyword is missing. |

## .init()
This is where `i18n-light` merges with Expressjs. Here a the `i18n-light` instance just configured is placed inside `response` object and is accessible from `res.i18n`. In addition to this it is also placed inside the `response.locals` object, making `i18n-light` accessibile from your views.

##Methods
### i18n.setLocale(locale)
Method used to change the current locale.

### i18n.getLocale()
Method used to get the current locale.

### i18n.resetLocale()
Method used to reset the current locale back to the default locale.

### i18n.__(path[,arg1 [,arg2[,..]]])

#### Dictionary
    module.exports = {
      "greetings": {
        "hello": "hello $s"
      }
    }

#### EJS Template
    <%= i18n.__('hello', 'node')%>    //will output 'hello node'

### i18n.__n(path[,arg1 [,arg2[,..]]], count)

#### Dictionary
    module.exports = {
      "messages": {
        "zero": "no messages",
        "one": "one message",
        "many": "%d messages"
      }
    }

#### EJS Template
    <%= i18n.__n('messages', 0) %>        //Will output 'no messages'
    <%= i18n.__n('messages', 1) %>        //Will output 'one message'
    <%= i18n.__n('messages', 5, 5) %>     //Will output '5 messages'

##Dictionaries
Dictionaries are just simple Node modules which exports JSON. It is important to name your dictionary the same as the locale. For example for locale `en`, the dictionary shall be named `en.js`.

    module.exports = {
      "greetings": {
        "hello": "hello"
      }
    }
