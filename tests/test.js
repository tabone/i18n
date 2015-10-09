'use strict'
/* global describe it afterEach beforeEach */

var i18n = null
var opts = null
var assert = require('assert')
var path = require('path')
var fs = require('fs')
var msg = null

describe('i18n-light module', function () {
  beforeEach(function () {
    i18n = require('../index')
    opts = {
      defaultLocale: 'en',
      dir: path.join(__dirname, 'locale'),
      fallback: false,
      extension: '.js',
      cache: true,
      refresh: true,
      context: {
        en: {
          'greetings': 'hello'
        },
        it: {
          'greetings': 'ciao'
        }
      },
      resolve: function (locale) {
        return {data: 'JSON from a resolve.'}
      }
    }
  })

  afterEach(function () {
    i18n = undefined
    opts = undefined
  })

  describe('configure method', function () {
    msg = 'when required attributes are not provided should throw an error:'
    describe(msg, function () {
      it('\'defaultLocale\'.', function () {
        delete opts.defaultLocale
        assert.throws(function () {
          i18n.configure(opts)
        }, Error, /defaultLocale/)
      })

      it('\'dir\', \'context\' and \'resolve\'.', function () {
        delete opts.dir
        delete opts.context
        delete opts.resolve
        assert.throws(function () {
          i18n.configure(opts)
        }, Error, /dir/)
      })
    })

    msg = 'should assign the valid attributes provided to i18n-light instance:'
    describe(msg, function () {
      beforeEach(function () {
        i18n.configure(opts)
      })

      it('\'fallback\'.', function () {
        assert(i18n._fallback === opts.fallback)
      })

      it('\'cache\'.', function () {
        assert(i18n._cache === opts.cache)
      })

      it('\'refresh\'.', function () {
        assert(i18n._refresh === opts.refresh)
      })

      it('\'extension\'.', function () {
        assert(i18n._extension === opts.extension)
      })

      it('\'defaultLocale\'.', function () {
        assert(i18n._defaultLocale === opts.defaultLocale)
      })

      it('\'dir\'.', function () {
        assert(i18n._dir === opts.dir + '/')
      })
    })

    describe('context attribute', function () {
      describe('if \'dir\' is omitted', function () {
        beforeEach(function () {
          delete opts.dir
          i18n.configure(opts)
        })
        it('should be assigned', function () {
          assert(i18n._context === opts.context)
        })
      })

      describe('if \'dir\' is not omitted', function () {
        it('shouldn\'t be assigned', function () {
          assert(i18n._context !== opts.context)
        })
      })
    })

    describe('resolve attribute', function () {
      describe('if \'dir\' and \'context\' are omitted', function () {
        beforeEach(function () {
          delete opts.dir
          delete opts.context
          i18n.configure(opts)
        })
        it('should be assigned', function () {
          assert(i18n._resolve === opts.resolve)
        })
      })

      describe('if \'dir\' is not omitted', function () {
        it('shouldn\'t be assigned', function () {
          assert(i18n._resolve !== opts.resolve)
        })
      })

      describe('if \'context\' is not omitted', function () {
        beforeEach(function () {
          delete opts.dir
        })
        it('shouldn\'t be assigned', function () {
          assert(i18n._resolve !== opts.resolve)
        })
      })
    })

    msg = 'when omittable fields are omitted they should use their defaults'
    describe(msg, function () {
      describe('fallback attribute', function () {
        beforeEach(function () {
          delete opts.fallback
          i18n.configure(opts)
        })

        describe('when it is omitted', function () {
          it('should default to \'true\'', function () {
            assert(i18n._fallback === true)
          })
        })
      })

      describe('cache attribute', function () {
        beforeEach(function () {
          delete opts.cache
          i18n.configure(opts)
        })

        describe('when it is omitted', function () {
          it('should default to \'true\'', function () {
            assert(i18n._cache === true)
          })
        })
      })
      describe('refresh attribute', function () {
        beforeEach(function () {
          delete opts.refresh
          i18n.configure(opts)
        })

        describe('when it is omitted', function () {
          it('should default to \'false\'', function () {
            assert(!(i18n._refresh))
          })
        })
      })

      describe('extension attribute', function () {
        beforeEach(function () {
          delete opts.extension
          i18n.configure(opts)
        })

        describe('when it is omitted', function () {
          it('should default to \'.js\'', function () {
            assert(i18n._extension === '.js')
          })
        })
      })
    })
  })

  describe('version', function () {
    beforeEach(function () {
      i18n.configure(opts)
    })

    it('should be the same as the version inside package.json.', function () {
      var packageJSON = require('fs')
        .readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
      assert(i18n.version === JSON.parse(packageJSON).version)
    })
  })

  describe('init', function () {
    var req = null
    var res = null
    var next = null

    beforeEach(function () {
      i18n.configure(opts)
      req = {}
      res = {
        locals: {}
      }
      next = {
        called: 0,
        fn: function () {
          this.called++
        }
      }
    })

    it('should return a function', function () {
      assert(i18n.init() instanceof Function)
    })

    describe('when middleware returned is invoked', function () {
      beforeEach(function () {
        i18n.init()(req, res, next.fn.bind(next))
      })

      it('should set .i18n equals to the instance.', function () {
        assert(res.i18n === i18n)
      })

      it('should set .locals.i18n equals to the instance.', function () {
        assert(res.locals.i18n === i18n)
      })

      it('should invoke next().', function () {
        assert(next.called === 1)
      })
    })
  })

  describe('setLocale', function () {
    var locale = null
    var altLocale = null
    beforeEach(function () {
      locale = Object.keys(opts.context)[0]
      altLocale = Object.keys(opts.context)[1]
      i18n.configure(opts)
      i18n.setLocale(altLocale)
      delete i18n._context[locale]
    })

    it('TEST INTERNAL: \'locale\' value should be defaultLocale.', function () {
      assert(locale === opts.defaultLocale)
    })

    describe('when current locale\'s context is not cached', function () {
      describe('and this._cache === false (clear cache)', function () {
        beforeEach(function () {
          i18n._cache = false
          i18n.setLocale(locale)
        })

        it('should only end up with current locale context.', function () {
          assert(Object.keys(i18n._context).length === 1)
        })

        it('should include the current locale dictionary context', function () {
          assert(i18n._context[locale] !== undefined)
        })
      })

      describe('and this._cache === true (don\'t clear cache)', function () {
        beforeEach(function () {
          i18n._cache = true
          i18n.setLocale(locale)
        })

        msg = 'should include the current locale dictionary context with the' +
          'other ones.'
        it(msg, function () {
          assert(Object.keys(i18n._context).length === 2)
        })

        msg = 'should include the current locale dictionary context.'
        it(msg, function () {
          assert(i18n._context[locale] !== undefined)
        })
      })
    })

    describe('when current locale\'s context is cached', function () {
      var testResult = 'hello'
      beforeEach(function () {
        i18n.configure(opts)
        i18n._context = {}
        i18n._context[locale] = testResult
        i18n._context[altLocale] = 'ciao'
      })

      describe('when this._cache === false (clear cache)', function () {
        beforeEach(function () {
          i18n._cache = false
        })

        describe('when refresh', function () {
          describe('=== true (get new dictionary)', function () {
            beforeEach(function () {
              i18n.setLocale(locale, true)
            })

            it('should only end up with current locale context.', function () {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should updated locale dictionary context', function () {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function () {
            beforeEach(function () {
              i18n.setLocale(locale, false)
            })

            it('should only end up with current locale context.', function () {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context.', function () {
              assert(i18n._context[locale] === testResult)
            })
          })
        })

        describe('when this.refresh', function () {
          describe('=== true (get new dictionary)', function () {
            beforeEach(function () {
              i18n._refresh = true
              i18n.setLocale(locale)
            })

            it('should only end up with current locale context.', function () {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should updated locale dictionary context', function () {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function () {
            beforeEach(function () {
              i18n._refresh = false
              i18n.setLocale(locale)
            })

            it('should only end up with current locale context.', function () {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context.', function () {
              assert(i18n._context[locale] === testResult)
            })
          })
        })
      })

      describe('when this._cache === true (don\'t clear cache)', function () {
        beforeEach(function () {
          i18n._cache = true
        })

        describe('when refresh', function () {
          describe('=== true (get new dictionary)', function () {
            beforeEach(function () {
              i18n.setLocale(locale, true)
            })

            msg = 'shouldn\'t end up with current locale context only.'
            it(msg, function () {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should updated locale dictionary context', function () {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function () {
            beforeEach(function () {
              i18n.setLocale(locale, false)
            })

            msg = 'shouldn\'t end up with current locale context only.'
            it(msg, function () {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context', function () {
              assert(i18n._context[locale] === testResult)
            })
          })
        })

        describe('when this.refresh', function () {
          describe('=== true (get new dictionary)', function () {
            beforeEach(function () {
              i18n._refresh = true
              i18n.setLocale(locale)
            })

            msg = 'shouldn\'t end up with current locale context only.'
            it(msg, function () {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should updated locale dictionary context', function () {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function () {
            beforeEach(function () {
              i18n._refresh = false
              i18n.setLocale(locale)
            })

            msg = 'shouldn\'t end up with current locale context only.'
            it(msg, function () {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function () {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context', function () {
              assert(i18n._context[locale] === testResult)
            })
          })
        })
      })
    })
  })

  describe('getLocale', function () {
    beforeEach(function () {
      i18n.configure(opts)
    })

    it('should return the \'currentLocale\'.', function () {
      var newLocale = 'it'
      i18n.setLocale(newLocale)
      assert(i18n.getLocale() === newLocale)
    })
  })

  describe('resetLocale', function () {
    var newLocale = null

    beforeEach(function () {
      i18n.configure(opts)
      newLocale = 'it'
    })

    it('should change the \'currentLocale\' to the default one.', function () {
      i18n.setLocale(newLocale)
      assert(i18n.resetLocale()._currentLocale === opts.defaultLocale)
    })
  })

  describe('setDefaultLocale', function () {
    var newLocale = null

    beforeEach(function () {
      i18n.configure(opts)
      newLocale = 'it'
    })

    it('should change the \'defaultLocale\'', function () {
      assert(i18n.setDefaultLocale(newLocale)._defaultLocale === newLocale)
    })
  })

  describe('clearCache', function () {
    beforeEach(function () {
      i18n.configure(opts)
    })

    describe('if refresh is undefined or false', function () {
      it('should clear the cached dictionaries.', function () {
        assert(Object.keys(i18n.clearCache()._context).length === 0)
      })
    })

    describe('if refresh is true', function () {
      it('should only have current locale directory cached.', function () {
        i18n.clearCache(true)._context

        assert(Object.keys(i18n._context).length === 1 &&
          i18n._context[i18n._currentLocale] !== undefined)
      })
    })
  })

  describe('refreshContext', function () {
    var testContext = {
      en: 'test 1',
      it: 'test 2'
    }

    describe('common functionality', function () {
      beforeEach(function () {
        opts.defaultLocale = 'en'
        i18n.configure(opts)
        i18n._context = JSON.parse(JSON.stringify(testContext))
      })

      describe('no arguments', function () {
        msg = 'should refresh the dictionary context of current locale.'
        it(msg, function () {
          assert(i18n.refreshContext()._context.en !== testContext.en)
        })
      })

      describe('with arguments', function () {
        msg = 'should refresh the dictionary context of the locale passed ' +
        'as an argument'
        it(msg, function () {
          assert(i18n.refreshContext('it')._context.it !== testContext.it)
        })
      })
    })

    describe('using \'dir\' attribute', function () {
      beforeEach(function () {
        opts.defaultLocale = 'en'
        i18n.configure(opts)
      })

      msg = 'should refresh the dictionary context of the locale passed ' +
        'as an argument'
      it(msg, function () {
        assert(i18n.refreshContext('it')._context.it !== testContext.it)
      })
    })

    describe('using \'resolve\' functionality', function () {
      beforeEach(function () {
        delete opts.dir
        delete opts.context
        opts.defaultLocale = 'en'
        i18n.configure(opts)
        i18n._context = JSON.parse(JSON.stringify(testContext))
      })

      msg = 'should refresh the dictionary context of the locale passed ' +
        'to use the JSON returned from resolve function.'
      it(msg, function () {
        assert(i18n.refreshContext('it')._context.it !== i18n._resolve('it'))
      })
    })
  })

  describe('isCached', function () {
    var noExistantLocale = 'es'

    beforeEach(function () {
      i18n.configure(opts)
    })

    msg = 'TEST RELATED: cached context should not has locale \'' +
      noExistantLocale + '\''

    it(msg, function () {
      assert(opts.context[noExistantLocale] === undefined)
    })

    it('should return true if \'locale\' is cached', function () {
      assert(i18n.isCached('en'))
    })

    it('should return false if \'locale\' is not cached.', function () {
      assert(!i18n.isCached(noExistantLocale))
    })
  })

  describe('_tidyExtension method', function () {
    it('should prepend a \'.\' if it doesn\'t have one.', function () {
      var ext = 'json'
      assert(i18n._tidyExtension(ext) === '.' + ext)
    })

    it('should do nothing if it begins with \'.\'.', function () {
      var ext = '.json'
      assert(i18n._tidyExtension(ext) === ext)
    })
  })

  describe('_tidyDir method', function () {
    it('should append a \'/\' if it doesn\' have one.', function () {
      var path = 'dict'
      assert(i18n._tidyDir(path) === path + '/')
    })

    it('should do nothing if it ends with \'/\'.', function () {
      var path = 'dict/'
      assert(i18n._tidyDir(path) === path)
    })
  })

  describe('_getContext', function () {
    beforeEach(function () {
      delete opts.dir
      i18n.configure(opts)
    })

    it('should return the context of the locale', function () {
      assert(i18n._getContext(opts.defaultLocale) ===
        opts.context[opts.defaultLocale])
    })
  })

  describe('__', function () {
    var context = {}
    beforeEach(function () {
      i18n.configure(opts)
      var localeDir = path.join(__dirname, 'locale')
      context.en = JSON.parse(fs.readFileSync(localeDir + '/en.js', 'utf-8'))
    })

    describe('with no sprintf parameters', function () {
      it('should return the localized phrase', function () {
        assert(i18n.__('greetings.text.hello') ===
          context.en.greetings.text.hello)
      })
    })

    describe('with sprintf parameters', function () {
      msg = 'should return the localized phrase with the placeholders'
      it(msg, function () {
        var name = 'Tom'
        assert(i18n.__('greetings.text.welcome', name) ===
          context.en.greetings.text.welcome.replace('%s', name))
      })
    })
  })

  describe('__n', function () {
    var tranPath = ''
    beforeEach(function () {
      i18n.configure(opts)
      tranPath = 'this.is.a.path'
    })

    describe('when last argument is not a number', function () {
      it('should append \'.zero\' to the path', function () {
        assert(!!~i18n.__n(tranPath).indexOf('.zero'))
      })
    })

    describe('when last argument is a number', function () {
      describe('when last argument is 0', function () {
        it('should append \'.zero\' to the path', function () {
          assert(!!~i18n.__n(tranPath, 0).indexOf('.zero'))
        })
      })

      describe('when last argument is 1', function () {
        it('should append \'.one\' to the path', function () {
          assert(!!~i18n.__n(tranPath, 1).indexOf('.one'))
        })
      })

      describe('when last argument > 1', function () {
        it('should append \'.many\' to the path', function () {
          assert(!!~i18n.__n(tranPath, 5).indexOf('.many'))
        })
      })
    })

    describe('sprintf', function () {
      var context = {}
      var sfparam = 2
      var i18nCount = 3
      beforeEach(function () {
        sfparam = 2
        i18nCount = 3
        var localeDir = path.join(__dirname, 'locale')
        context.en = JSON.parse(fs.readFileSync(localeDir + '/en.js', 'utf-8'))
      })

      describe('when only path and count are given', function () {
        it('should not use count as a sprintf param.', function () {
          assert(i18n.__n('messages', i18nCount) !== (sfparam + ' messages'))
        })
      })

      msg = 'when path, count and sprintf params are given'
      describe(msg, function () {
        it('should use them as intended', function () {
          assert(i18n.__n('messages', sfparam, i18nCount) ===
            (sfparam + ' messages'))
        })
      })
    })
  })

  describe('_translate', function () {
    var context = {}

    beforeEach(function () {
      var localeDir = path.join(__dirname, 'locale')
      context.en = JSON.parse(fs.readFileSync(localeDir + '/en.js', 'utf-8'))
      context.it = JSON.parse(fs.readFileSync(localeDir + '/it.js', 'utf-8'))
    })

    describe('clearing cache', function () {
      beforeEach(function () {
        i18n.configure(opts)
        i18n.clearCache()
      })

      it('should refresh default locale context.', function () {
        var path = 'greetings.text.hello'
        assert(i18n.__(path) === context.en.greetings.text.hello)
      })
    })

    describe('when fallback === true', function () {
      beforeEach(function () {
        opts.fallback = true
        i18n.configure(opts)
        i18n.setLocale('it')
      })

      describe('and path is', function () {
        describe('good', function () {
          it('should return the localized phrase.', function () {
            assert(i18n._translate('greetings.text.hello') ===
              context.it.greetings.text.hello)
          })
        })

        describe('invalid', function () {
          describe('for both current and default locale', function () {
            it('should return the path.', function () {
              var path = 'no.exist'
              assert(i18n._translate(path) === path)
            })
          })

          describe('for current locale', function () {
            it('should return the phrase from default locale.', function () {
              var path = 'messages.zero'
              assert(i18n._translate(path) === context.en.messages.zero)
            })
          })
        })

        describe('short', function () {
          describe('for both current and default locale', function () {
            it('should return the path.', function () {
              var path = 'greetings'
              assert(i18n._translate(path) === path)
            })
          })

          describe('for current locale', function () {
            it('should return the phrase from default locale.', function () {
              var path = 'greetings.bye'
              assert(i18n._translate(path) === context.en.greetings.bye)
            })
          })
        })

        describe('long for current locale', function () {
          describe('for both current and default locale', function () {
            it('should return the path.', function () {
              var path = 'no.exist'
              assert(i18n._translate(path) === path)
            })
          })

          describe('for current locale', function () {
            it('should return the phrase from default locale.', function () {
              var path = 'greetings.text.welcome'
              assert(i18n._translate(path) ===
                context.en.greetings.text.welcome)
            })
          })
        })
      })
    })

    describe('when fallback === false', function () {
      beforeEach(function () {
        opts.fallback = false
        i18n.configure(opts)
        i18n.setLocale('it')
      })

      describe('and path is', function () {
        describe('good', function () {
          it('should return the localized phrase.', function () {
            assert(i18n._translate('greetings.text.hello') ===
              context.it.greetings.text.hello)
          })
        })

        describe('invalid for current locale', function () {
          it('should return the path.', function () {
            var path = 'no.exist'
            assert(i18n._translate(path) === path)
          })
        })

        describe('short for current locale', function () {
          it('should return the path.', function () {
            var path = 'greetings.text'
            assert(i18n._translate(path) === path)
          })
        })

        describe('long for current locale', function () {
          it('should return the path.', function () {
            var path = 'greetings.text.hello.woops'
            assert(i18n._translate(path) === path)
          })
        })
      })
    })
  })
})
