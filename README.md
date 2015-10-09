[![Build Status](https://travis-ci.org/tabone/i18n.svg?branch=master)](https://travis-ci.org/tabone/i18n)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Coverage Status](https://coveralls.io/repos/tabone/i18n/badge.svg?branch=master&service=github)](https://coveralls.io/github/tabone/i18n?branch=master)

# i18n-light

## Installation

```bash
npm install --save i18n-light
```

```bash
bower install --save i18n-light
```

## Motiviation
My main motivation in developing `i18n-light` was to create a localization module which enabled a developer to use the same storage (`dictionaries`) for both `Back-end` and `Front-end` code, thus having localized phrases more consistent and organized.

## Vocabulary
| Name | Description |
|------|-------------|
| `Dictionary` | A `JSON file` which `i18n-light` will use for localization. |
| `Dicionary Contexts` | Is the `JSON` of a locale. This reside within a `dictionary` and is this `Object` which `i18n-light` will be using for localization. |
| `Dictionary Path` | Is the path which i18n-light need to travel through the `dictionary context`. |
| `Locale` | A name for a dictionary. |

## Usage
### Structure
```
  app
  ├── dict/
  |   ├── en.json
  |   └── it.json
  └── server.js
```

### Dictionaries
#### dict/en.json

```javascript
{
  "common": {
    "logo": "i18n-light"
  },
  "home": {
    "logout": "Logout",
    "loggedin": "Hello %s",
    "messages": {
      "zero": "No messages",
      "one": "1 message",
      "many": "%s messages"
    }
  }
}
```
#### dict/it.json

```javascript
{
  "home": {
    "logout": "Esci",
    "loggedin": "Ciao %s",
    "messages": {
      "zero": "0 messaggi",
      "one": "1 messaggio",
      "many": "%s messaggi"
    }
  }
}
```

### Basic Example

```javascript
var i18n = require('i18n-light')

i18n.configure({
  defaultLocale: 'en',
  dir: path.join(__dirname, 'dict'),
  extension: '.json'
})
```

### Express Example

```javascript
var express = require('express')
  , app = express()
  , i18n = require('i18n-light')

...

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
  console.log(i18n.__('common.logo'))          // => 'i18n-light'
  console.log(i18n.__('home.logout'))          // => 'Logout'
  console.log(i18n.__('home.loggedin', 'Tom')) // => 'Hello Tom'
  console.log(i18n.__('home.messages', 2))     // => '2 messages'
})

app.get('/it', function(req, res) {
  i18n.setLocale('it')
  console.log(i18n.__('common.logo'))          // Will fallback to en => 'i18n-light'
  console.log(i18n.__('home.logout'))          // => 'Esci'
  console.log(i18n.__('home.loggedin', 'Tom')) // => 'Ciao Tom'
  console.log(i18n.__('home.messages', 2))     // => '2 messaggi'
})

...

require('http').createServer(app).listen(8080)
```

### Views Example

```html
...
<body>
  <span><%=i18n.__('common.logo')%></span> <!-- i18n-light -->
</body>
...
```

## Options
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `defaultLocale` | `String` | `Required` | The locale which `i18-light` will fallback if a `dictionary path` isn't resolvable in the current dictionary. |
| `dir` | `String` | N/A | The directory path where the `dictionaries` will reside. |
| `context` | `Object` | N/A | Instead of using `dir` to instruct `i18n-light` from where to retrieve the dictionaries, you can pass `dictionaries` directly through the `context`. Note: `i18n-light` will only look for this attribute if dir isn't specified. More information below. |
| `fallback` | `Boolean` | `true` | Indicates whether `i18n-light` should fallback to the `defaultLocale` `dictionary context` if the path is invalid in the `dictionary context` of the current locale. |
| `refresh` | `Boolean` | `false` | Indicates whether `i18n-light` should retrieve an update of the `dictionary context` (`true`) or keep using what is already cached (`false`). |
| `cache` | `Boolean` | `true` | Indicates whether `i18n-light` should cache `dictionary context`s (`true`) or not (`false`). |
| `extension` | `String` | `.js` | The `extension` of the `dictionary` files. |
| `resolve` | `Function` | `null` | Instead of using `dir` or `context` you can use this function to code your own resolver for your `dictionary` files. Note that `i18n-light` will only use this function if your `i18n-light` instance is not configured using either `context` or `dir`. More info on how to use [here](#using-your-own-resolver)|

## API
### configure(opts)
Method used to configure (initiate) an instance of `i18n-light`. Take a look at the [options section](#options) to understand what options it accepts.

```javascript
...
i18n.configure({
  dir: path.join(__dirname, 'dict'),
  defaultLocale: 'en',
  fallback: true
})
...
```

### init()
Middleware method. This is the method used to integrate `i18n-light` instance to `Express`. Take a look at the [usage section](#usage) example to see how this can be easily done. This method makes your `i18n-light` instance accessible from:

1. `res.i18n`
2. `res.locals.i18n` - making your instances accessible from your views.

```javascript
...
app.use(i18n.init())
...
```

### resetLocale([refresh])
Method used to reset the current locale to the default one. It has an optional parameter `refresh` which when its `true` `i18n-light` updates the dictionary context of the default locale.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.setLocale('it')  //default locale is now 'it'
...
i18n.resetLocale()  //default locale is now 'en'
```

### setLocale(locale[, refresh])
Method used to change the current locale of your `i18n-light` instance to `locale`. It has an `optional` argument `refresh` which when its `true`, `i18n-light` updates the dictionary context of `locale`.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.setLocale('it')  //default locale is now 'it'
```

### getLocale()
Method used to get the name of the current locale.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.getLocale()  // => en
...
i18n.setLocale('it')
...
i18n.getLocale()  // => it
```

### isCached(locale)
Method used to check whether a `dictionary context` of `locale` is cached or not.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.isCached('en')  // => true
...
i18n.isCached('it')  // => false
...
i18n.setLocale('it')
...
i18n.isCached('it')  // => true
```

### setDefaultLocale(locale)
Method used to change the default locale of your `i18n-light` instance to `locale`.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.getLocale()              // => en
...
i18n.setDefaultLocale('it')   // => true
...
i18n.getLocale('it')          // => it
```

### refreshContext([locale])
Method used to refresh the `dictionary context` of `locale`.

### clearCache([refresh])
Method used to clear the cache of your `i18n-light` instance.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.setLocale('it')    // => en
...
i18n.isCached('en')     // => true
i18n.isCached('it')     // => true
...
i18n.clearCache()
...
i18n.isCached('en')     // => false
i18n.isCached('it')     // => false
```

It has an `optional` argument `refresh` which when its true, `i18n-light` refreshes the `dictionary context` of the current locale.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.setLocale('it')    // => en
...
i18n.isCached('en')     // => true
i18n.isCached('it')     // => true
...
i18n.clearCache(true)
...
i18n.isCached('en')     // => false
i18n.isCached('it')     // => true
```

### __(path[,arg1 [,arg2[,..]]])
Method used by `i18n-light` to convert `path` to the localized phrase within the current `dictionary context` of the current locale (or default locale if path is invalid and `fallback` === true).

This method makes use of [sprintf-js](https://www.npmjs.com/package/sprintf-js), enabling you to include placeholders in your `dictionary` phrases (see example).

Note that if `path` is not resolvable `i18n-light` will return the path itself.

#### Dictionary
```javascript
{
  "home": {
    "login": "Login",
    "welcome": "Welcome %s"
  }
}
```

#### Code
```javascript
...
i18n.__('home.login')           // => 'Login'
i18n.__('home.welcome', 'Tom')  // => 'Welcome Tom'
...
```

### __n(path[,arg1 [,arg2[,..]]], count)
Method used by `i18n-light` to convert `path` to a quantitative localized phrase within the current `dictionary context` of the current locale (or default locale if path is invalid and `fallback` === true).

This method makes use of [sprintf-js](https://www.npmjs.com/package/sprintf-js), enabling you to include placeholders in your `dictionary` phrases (see example).

Note that if `path` is not resolvable `i18n-light` will return the path itself.

Also note that the last argument (`count`) is used only by `i18n-light` and not by `sprintf-js`.

If `count === 0` or is a `String` it will append `.zero` to `path`.

If `count === 1` it will append `.one` to `path`.

If `count > 1` it will append `.many` to `path`.

#### Dictionary
```javascript
{
  "home": {
    "messages": {
      "zero": "No messages",
      "one": "1 message",
      "many": "%s messages"
    }
  }
}
```

#### Code
```javascript
...
i18n.__n('home.messages', 0)      // => 'No messages'
i18n.__n('home.messages', 1)      // => '1 Message'
i18n.__n('home.messages', 3)      // => 'undefined messages'
i18n.__n('home.messages', 3, 3)   // => '3 messages'
...
```

## Using your own Resolver
As already mentioned in the [options](#options) section, `i18n-light` will only use this functionality if it hasn't been configured with `dir` or `context` options. When a context of a locale is needed, `i18n-light` will call this function with the locale name passed as the parameter. This function should then return a `dictionary context` in the form of a JSON.

```javascript
i18n.configure({
  defaultLocale: 'en',
  resolve: function(locale){
    $.ajax({
      type: 'GET',
      url: 'dict/' + locale + '.js',
      dataType: 'json',
      success: function(data) {
        return data
      },
      async: false
    });
  }
  ...
})
```

## Browserify
Intead of using the `dir` option to point to the dictionaries directory, you have the possibility to inject your own `dictionary context`s during the configuration of `i18n-light` instance using `context` option. As already stated, in order for `i18n-light` to use the `context` option, the `dir` option needs to be omitted.

The following example shows how can this be done using [brfs](https://www.npmjs.com/package/brfs) for `browserify`.

```javascript
var i18n = require('i18n-light');

i18n.configure({
  defaultLocale: document.documentElement.lang,
  context: { 'en': JSON.parse(require('fs')
                      .readFileSync('en.js', 'utf-8'))
            , 'it': JSON.parse(require('fs')
                      .readFileSync('it.js', 'utf-8'))
            }
})
```