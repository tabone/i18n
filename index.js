'use strict'
/**
 * Dictionaries (files):
 * Dictionary Path:
 * Locale:
 * Dicionary Contexts
 */

/**
 * i18n-light object.
 * @type {Object}
 */
var i18n = {}

/**
 * method used to initialize all instance variables.
 * a.k.a the excuse to document instance variables.
 * @return {i18n}   the instance.
 */
i18n._init = function _init() {
  /**
   * this is the locale which i18n-light will fallback
   * if the provided dictionary path isn't found on the
   * current locale dictionary.
   * @type {String}
   */
  this._defaultLocale = null

  /**
   * this is the directory where i18n-light will be
   * searching dictionaries from.
   * @type {String}
   */
  this._dir = null

  /**
   * indicates whether i18n-light should fallback to
   * the defaultLocale if a dictionary path isn't found.
   * @type {Boolean}
   */
  this._fallback = true

  /**
   * object which i18n-light will be using to store
   * locale dictionaries contexts.
   * @type {Object}
   */
  this._context = {}

  /**
   * the current locale.
   * @type {String}
   */
  this._currentLocale = null

  /**
   * indicates whether i18n-light should keep old dictionary
   * contexts once the current locale is changed.
   * @type {Boolean}
   */
  this._cache = true

  /**
   * the dictionaries files extension.
   * @type {String}
   */
  this._extension = '.js'

  /**
   * indicates whether i18n-light should override existant
   * dictionary contexts or not when a locale changes.
   * @type {Boolean}
   */
  this._refresh = false

  return this
}

/**
 * method used to intialize the i18n-light instance.
 * can be considered as the object constructor.
 * @param  {Object}   opts    configuration object.
 * @return {i18n}     the instance.
 */
i18n.configure = function configure(opts) {
  this._init()

  this._fallback = (opts.fallback !== undefined)
    ? opts.fallback : this._fallback

  this._cache = (opts.cache !== undefined)
    ? opts.cache : this._cache

  this._refresh = (opts.refresh)
    ? opts.refresh : this._refresh

  this._extension
    = this._setExtension((opts.extension || this._extension))

  if(opts.defaultLocale) {
    this._defaultLocale = opts.defaultLocale
  } else {
    throw new Error('Please provide a default locale which i18n-light will '
      + 'fallback using the \'defaultLocale\' attribute.')
  }

  if(opts.dir) {
    this._dir = opts.dir
  } else if(opts.context) {
    this._context = opts.context
  } else {
    throw new Error('Please provide the directory where your dictionaries '
      + 'are located using the \'dir\' attribute or the dictionary context '
      + 'itself using \'context\'')
  }

  this.resetLocale()
}

/**
 * method used to format the extension string into a valud extension.
 * this is done by including a '.' if the extension string isn't prefixed
 * with one.
 * @param {String}    extension   an extension prifixed with '.'
 */
i18n._setExtension = function _setExtension(extension) {
  if(extension[0] !== '.') extension = '.' + extension
  return extension
}

/**
 * method used to reset the current locale back to the
 * default locale.
 * @param {Boolean}   refresh     indicates whether the dictionary
 *                                context of the default locale
 *                                should be updated or not.
 * @return {i18n}     the instance.
 */
i18n.resetLocale = function resetLocale(refresh) {
  return this.setLocale(this._defaultLocale, refresh)
}

/**
 * method used to change the current locale.
 * @param {String}    locale      the new locale.
 * @param {Boolean}   refresh     indicates whether the dictionary
 *                                context of the current locale
 *                                should be updated or not.
 * @return {i18n}     the instance
 */
i18n.setLocale = function setLocale(locale, refresh) {
  //change the current locale.
  this._currentLocale = locale

  /*
   * i18n-light should only retrieve the locale dictionary context if:
   *     1. there is no cached dictionary for the new locale.
   *     2. refresh is true.
   *     3. refresh is undefined and this._refresh is true.
   */
  if(!(this.localeCached(this._currentLocale))) {
    if(!(this._cache)) {
      //clear cache only if this._cache === false
      this.clearCache()
    }
    //retrieve the current locale's dictionary since it not cached.
    this.refreshContext()
  } else {
    /**
     * indicates whether to refresh the current locale's
     * dictionary context or not. if refresh is not passed
     * i18n-light should fallback to this._refresh
     * @type {Boolean}
     */
    var refresh = (refresh !== undefined) ? refresh : this._refresh

    /**
     * object which will contain the dictionary context of the current
     * locale if this._cache === false (i.e. reset this._context) and
     * refresh === false (i.e. keep the current locale dicionary context).
     * this is done because when this.clearCache() is executed, i18n-light
     * completly destroys this._context and thus losing the current
     * locale's context making us unable to restore the locale's dictionary.
     * @type {Object}
     */
    var context = null

    /*
      as stated i18n-light will only keep the current locale's dictionary if
      refresh === false and this.cache === false.
     */
    if(!(refresh) && !(this._cache))
      context = this._context[this._currentLocale]

    /*
      once we have the current locale's context we can clear the cache if
      this._cache === false.
     */
    if(!(this._cache)) this.clearCache()
      
    if(refresh) {
      /*
        if refresh === true, i18n-light will retrieve the updated
        dictionary context.
       */
      this.refreshContext()
    } else if(!(this._cache)) {
      /*
        if user chooses to keep current dictionary context and to clear
        the cache i18n-light will use the 'context' object.
       */
      this._context[this._currentLocale] = context
    }
    /*
      else i18n-light doesn't care because user chose to keep the same
      dictionary context (refresh === false) and not to reset the cache 
      (this.cache === true). :D
     */
  }
  return this
}

/**
 * method used to determine whether a locale has
 * cached dictionary context or not.
 * @param  {String}     locale    the locale name
 * @return {Boolean}    True if it has, false otherwise
 */
i18n.localeCached = function localeCached(locale) {
  return (this._context[locale])
}

/**
 * method used to change the default locale of an i18n-light instance.
 * @param {i18n} locale   the instance.
 */
i18n.setDefaultLocale = function setDefaultLocale(locale) {
  this._defaultLocale = locale
  return this
}

/**
 * method used to return the current locale i18n-light is
 * using.
 * @return {String}     the current locale.
 */
i18n.getLocale = function getLocale() {
  return this._currentLocale
}

/**
 * method used to refresh the dictionary context of
 * @param  {String}     locale    the name of the locale which i18n-light
 *                                will update its dictionary context.
 * @return {i18n}       the instance.
 */
i18n.refreshContext = function refreshContext(locale) {
  var locale = (typeof locale === 'string') ? locale : this._currentLocale

  if(this._dir) {
    var path = require('path')
      .join(this._dir, locale + this._extension)

    this._context[locale]
     = JSON.parse(require('fs').readFileSync(path, 'utf-8'))
  }
  
  return this
}

/**
 * method used to clear the context object cached data.
 * @param  {Boolean}    refresh    indicates whether to retrieve 
 *                                 the dictionary context of the
 *                                 current locale.
 * @return {i18n}       the instance.
 */ 
i18n.clearCache = function clearCache(refresh) {
  this._context = {}
  if(refresh) this.refreshContext()
  return this
}

/**
 * method used to get the dictionary context of a particular locale.
 * @param  {String}   locale    the locale name.
 * @return {Object}   The dictionary context
 */
i18n._getContext = function _getContext(locale) {
  return this._context[locale]
}

/**
 * i18n-light middleware function.
 * @return {Function}     middleware
 */
i18n.init = function init() {
  var self = this
  return function(req, res, next) {
    self.resetLocale()
    res.i18n = self
    res.locals.i18n = self
    next()
  }
}

/**
 * method used to translate a phrase.
 * @param  {String}     path    the path of the localized phrase within the 
 *                              dictionary context.
 * @return {String}     the translated quantitative phrase
 */
i18n.__ = function __(path) {
  /*
    translating the phrase while using sprintf to include placeholders.
   */
  var args = Array.prototype.slice.call(arguments, 1)
  return require('sprintf-js').vsprintf(this._translate(path), args)
}

/**
 * method used to translate a quantitative phrase. note that the i18n-light
 * uses the last parameter to determine the quantity.
 * @param  {String}     path    the path of the localized phrase within the 
 *                              dictionary context.
 * @return {String}     the translated quantitative phrase.
 */
i18n.__n = function __n(path) {
  /**
   * the quantity. if the last parameter isn't a number, i18n-light will
   * consider it as a 0.
   * @type {number}
   */
  var amount = (!isNaN(arguments[arguments.length - 1]))
    ? Number(arguments[arguments.length - 1]) : 0

  /*
    based on the value of amount i18n-light will be appending a node to the
    current path.
   */
  if(amount === 0) {
    path += '.zero'
  } else if(amount === 1) {
    path += '.one'
  } else {
    path += '.many'
  }

  /*
    translating the quantitative phrase while using sprintf to include
    placeholders.
   */
  var args = Array.prototype.slice.call(arguments, 1)
  return require('sprintf-js').vsprintf(this._translate(path), args)
}

/**
 * method used to go through the dictionary context of the locales
 * to retrieve a localized phrase.
 * @param  {String}   path    the path of the localized phrase within the 
 *                            dictionary context.
 * @param  {Boolean}  def     indicates wether to loop the current locale or
 *                            the default locale.
 * @return {String}   the localized phrase or the path provided if path is 
 *                    invalid. 
 */
i18n._translate = function _translate(path, def) {
  /**
   * the name of the name of the locale i18n-light will be using for the
   * translation.
   * @type {String}
   */
  var locale = (def) ? this._defaultLocale : this._currentLocale

  /*
    when def is true i.e. a path hasn't been found in the current locale
    and the user has chosen to fallback to the default locale, we need
    to make sure that the context of the default locale exists!
   */
  if(def && this._context[locale] === undefined)
    this.refreshContext(this.locale)

  /**
   * the dictionary contextx of the locale i18n-light will be using for
   * the translation.
   * @type {Object}
   */
  var obj = this._getContext(locale)

  /**
   * splitting the path to an array.
   * @type {Array[String]}
   */
  var pathArr = path.split('.')

  /*
    i18n-light will be looping through each node of the path given and
    while traversing the dictionary context of the current or default
    locale.
   */
  for(var i = 0; i < pathArr.length; i++) {
    /**
     * this represent a key of the dictionary context being traversed.
     * @type {String}
     */
    var node = pathArr[i]

    if(obj[node] !== undefined) {
      if(typeof obj[node] !== 'object') {
        /*
          if the value of the key in the dictionary context is not of type
          object, it means that it is the end of the dictionary context thus,
          it should also be the end of the path. if this is valid the
          'localized string' is returned however if the path is longer, it
          means that the path is invalid and therefore the 'path' should be
          returned.
         */
        if(i < (pathArr.length - 1)) break
        path = obj[node]
      } else {
        /*
          if the value of the key in the dictionary context is of type
          object, it means that it isn't the end of the dictionary contest, thus
          the path should have more nodes.
         */
        if(i === (pathArr.length - 1)) break
        obj = obj[node]
      }
    } else if((locale !== this._defaultLocale) && this._fallback) {
      /*
        if i18n-light has failed to find a key in the dictionary context of
        the locale currently being traversed, i18n-light is able to fallback
        on the default locale. obviously it only does this if:
          1. the current locale being traversed is not the default locale
             (since it will cause an infinite loop o.o) and
          2. the user has chosen to make use of this functionality by passing
              fallback = true.
       */
      this._translate(path, true)
      //stop the loop!
      break
    }
  }
  return path
}

module.exports = Object.create(i18n)
