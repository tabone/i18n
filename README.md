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
  res.send(i18n.__('hello'))
})

app.get('/it', function(req, res) {
  i18n.setLocale('it')
  res.send(i18n.__('hello'))
})

...

require('http').createServer(app).listen(8080)
```

## Vocabulary
| Name | Description |
|------|-------------|
| `Dictionary` | A `JSON file` which `i18n-light` will use for localization. |
| `Dicionary Contexts` | Is the `JSON` of a locale. This reside within a `dictionary` and is this `Object` which `i18n-light` will be using for localization. |
| `Dictionary Path` | Is the path which i18n-light need to travel through the `dictionary context`. |
| `Locale` | A name for a dictionary. |

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
Middleware method. This is the method used to integrate `i18n-light` instance to `Express`. Take a look at the (usage section)[#usage] to see how this can be easily done.

```javascript
...
app.use(i18n.init())
...
```

### resetLocale([refresh])
Method used to reset the current locale to the default locale. It has an optional parameter `refresh` which when its `true` it updates the dictionary context of the default locale.

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
Method used to change the current locale of your `i18n-light` instance to `locale`. It has an `optional` argument `refresh` which when its `true` it updates the dictionary context of the `locale`.

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
Method used to check whether a `dictionary context` of a `locale` is cached or not.

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
i18n.isCached('en') // => true
i18n.isCached('it') // => true
...
i18n.clearCache()
...
i18n.isCached('en') // => false
i18n.isCached('it') // => false
```

It has an `optional` argument `refresh` which when its true, it refreshes the `dictionary context` of the current locale.

```javascript
i18n.configure({
  defaultLocale: 'en'
  ...
})
...
i18n.setLocale('it')    // => en
...
i18n.isCached('en') // => true
i18n.isCached('it') // => true
...
i18n.clearCache(true)
...
i18n.isCached('en') // => false
i18n.isCached('it') // => true
```

### __(path[,arg1 [,arg2[,..]]])
### __n(path[,arg1 [,arg2[,..]]], count)