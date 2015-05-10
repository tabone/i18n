"use strict"
var path = require('path')
  , sprintf = require('sprintf-js')

var i18n = function() {
  if(!(this instanceof i18n)) {
    return new i18n()
  }

  /**
   * This is an object which will contain any config set by the user.
   * @type {Object}
   */
  this._config = {}

  /**
   * An object which will hold all the required contexts.
   * @type {Object}
   */
  this._context = {}

  /**
   * The current locale
   * @type {String}
   */
  this._currentLocale = undefined

  /**
   * Object consisting of rules of available configs.
   * @type {Object}
   */
  this._configDetails = {
    defaultLocale: {
      required: true
    },
    dir: {
      required: true
    },
    fallback: {
      value: true
    }
  }
}

/**
 * Method used to configure the i18n module
 * @param  {Object} opts  Configuration object.
 * @return {i18n}         The object itself.
 */
i18n.prototype.configure = function(opts) {
  for(var key in this._configDetails) {
    if(opts[key] !== undefined
        && (typeof opts[key] === 'boolean'
        || opts[key].length > 0)) {
      this._config[key] = opts[key]
    } else if(this._configDetails[key].required) {
      throw new Error('Please provide a ' + key + ' for your application.')
    } else if(this._configDetails[key].value !== undefined) {
      this._config[key] = this._configDetails[key].value
    }
  }

  this._currentLocale = this._config.defaultLocale
  this._getContext()
  return this
}

/**
 * Method used to integrate this object with the middleware.
 */
i18n.prototype.init = function() {
  var self = this
  return function(req, res, next) {
    res.i18n = self
    res.locals.i18n = self
    next()
  }
}

/**
 * Method used to retrieve the context from the specified directory.
 * @return {i18n} The instance itself
 */
i18n.prototype._getContext = function() {
  if(this._context[this._currentLocale] === undefined)
    this._context[this._currentLocale] 
        = require(path.join(this._config.dir, (this._currentLocale + '.js')))
  return this
}

/**
 * Method used to get the current locale.
 * @return {String} The current locale
 */
i18n.prototype.getLocale = function() {
  return this._currentLocale
}

/**
 * Method used to change the locale.
 * @param {String} locale The new locale
 */
i18n.prototype.setLocale = function(locale) {
  this._currentLocale = locale
  this._getContext()
}

/**
 * Translation method.
 * @param  {String}   path An object path
 * @param  {Boolean}  def  True if the default locale will be used false other wise
 * @return {String}      The phrase
 */
i18n.prototype.__ = function(path){
  var args = Array.prototype.slice.call(arguments, 1)
  return sprintf.vsprintf(this._getPhrase(path), args)
}

i18n.prototype.__n = function(path) {
  var args = Array.prototype.slice.call(arguments, 1)
  var count = arguments[arguments.length - 1]

  if(count === 0) {
    path += '.zero'
  } else if(count === 1)  {
    path += '.one'
  } else {
    path += '.many'

  }

  return sprintf.vsprintf(this._getPhrase(path), args)
}

i18n.prototype._getPhrase = function(path, def) {
  var arr = path.split('.')
    , obj = (def) ? (this._context[this._config.defaultLocale])
      : (this._context[this._currentLocale])
    , str = path

  arr.forEach(function(data) {
    if(obj[data] !== undefined) {
      if(typeof obj[data] === 'string') {
        str = obj[data]
      } else {
        obj = obj[data]
      }
    } else if(this._currentLocale !== this._config.defaultLocale
        && !(def) && (this._config.fallback)) {
      str = this._getPhrase(path, true)
    }
  }.bind(this))

  return str
}

module.exports = i18n()