'use strict'

var i18n = undefined
  , opts = undefined
  , assert = require('assert')
  , path = require('path')
  , fs = require('fs')
  , msg = null

describe('i18n-light module', function() {
  beforeEach(function() {
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
      }
    }
  })

  afterEach(function() {
    i18n = undefined
    opts = undefined
  })

  describe('configure method', function() {
    msg = 'when required attributes are not provided should throw an error:'
    describe(msg, function() {
      it('\'defaultLocale\'.', function() {
        delete opts.defaultLocale
        assert.throws(function() {
          i18n.configure(opts)
        }, Error, /defaultLocale/)
      })

      it('\'dir\' and \'context\'.', function() {
        delete opts.dir
        delete opts.context
        assert.throws(function() {
          i18n.configure(opts)
        }, Error, /dir/)
      })
    })

    msg = 'should assign the valid attributes provided to i18n-light instance:'
    describe(msg, function() {
      beforeEach(function() {
        i18n.configure(opts)
      })

      it('\'defaultLocale\'.', function() {
        assert(i18n._defaultLocale === opts.defaultLocale)
      })

      it('\'dir\'.', function() {
        assert(i18n._dir === opts.dir)
      })

      it('\'cache\'.', function() {
        assert(i18n._cache === opts.cache)
      })

      it('\'fallback\'.', function() {
        assert(i18n._fallback === opts.fallback)
      })

      it('\'extension\'.', function() {
        assert(i18n._extension === opts.extension)
      })

      it('\'refresh\'.', function() {
        assert(i18n._refresh === opts.refresh)
      })
    })

    describe('context attribute', function() {
      describe('if \'dir\' is omitted', function() {
        beforeEach(function() {
          delete opts.dir
          i18n.configure(opts)
        })
        it('should be assigned', function() {
          assert(i18n._context === opts.context)
        })
      })

      describe('if \'dir\' is not omitted', function() {
        it('shouldn\'t be assigned', function() {
          assert(i18n._context !== opts.context)
        })
      })
    })

    msg = 'when omittable fields are omitted they should use their defaults'
    describe(msg, function() {
      describe('extension attribute', function() {
        beforeEach(function() {
          delete opts.extension
          i18n.configure(opts)
        })

        describe('when it is omitted', function() {
          it('should default to \'.js\'', function() {
            assert(i18n._extension === '.js')
          })
        })
      })

      describe('refresh attribute', function() {
        beforeEach(function() {
          delete opts.refresh
          i18n.configure(opts)
        })

        describe('when it is omitted', function() {
          it('should default to \'false\'', function() {
            assert(!(i18n._refresh))
          })
        })
      })

      describe('cache attribute', function() {
        beforeEach(function() {
          delete opts.cache
          i18n.configure(opts)
        })

        describe('when it is omitted', function() {
          it('should default to \'true\'', function() {
            assert(i18n._cache === true)
          })
        })
      })
    })
  })

  describe('setLocale', function() {
    var locale = null
    var altLocale = null
    beforeEach(function() {
      locale = Object.keys(opts.context)[0]
      altLocale = Object.keys(opts.context)[1]
      i18n.configure(opts)
      i18n.setLocale(altLocale)
      delete i18n._context[locale]
    })

    it('TEST INTERNAL: \'locale\' value should be defaultLocale.', function() {
      assert(locale === opts.defaultLocale)
    })

    describe('when current locale\'s context is not cached', function() {
      describe('and this._cache === false (clear cache)', function() {
        beforeEach(function() {
          i18n._cache = false
          i18n.setLocale(locale)
        })

        it('should only end up with current locale context.', function() {
          assert(Object.keys(i18n._context).length === 1)
        })

        it('should include the current locale dictionary context', function() {
          assert(i18n._context[locale] !== undefined)
        })
      })

      describe('and this._cache === true (don\'t clear cache)', function() {
        beforeEach(function() {
          i18n._cache = true
          i18n.setLocale(locale)
        })

        msg = 'should include the current locale dictionary context with the'
          + 'other ones.'
        it(msg, function() {
          assert(Object.keys(i18n._context).length === 2)
        })

        it('should include the current locale dictionary context.', function() {
          assert(i18n._context[locale] !== undefined)
        })
      })
    })

    describe('when current locale\'s context is cached', function() {
      var testResult = 'hello'
      beforeEach(function() {
        i18n.configure(opts)
        i18n._context = {}
        i18n._context[locale] = testResult
        i18n._context[altLocale] = 'ciao'
      })

      describe('when this._cache === false (clear cache)', function() {
        beforeEach(function() {
          i18n._cache = false
        })

        describe('when refresh', function() {
          describe('=== true (get new dictionary)', function() {
            beforeEach(function() {
              i18n.setLocale(locale, true)
            })

            it('should only end up with current locale context.', function() {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should include the current locale dictionary context', function() {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function() {
            beforeEach(function() {
              i18n.setLocale(locale, false)
            })

            it('should only end up with current locale context.', function() {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context.', function() {
              assert(i18n._context[locale] === testResult)
            })
          })
        })

        describe('when this.refresh', function() {
          describe('=== true (get new dictionary)', function() {
            beforeEach(function() {
              i18n._refresh = true
              i18n.setLocale(locale)
            })

            it('should only end up with current locale context.', function() {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should include the current locale dictionary context', function() {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function() {
            beforeEach(function() {
              i18n._refresh = false
              i18n.setLocale(locale)
            })

            it('should only end up with current locale context.', function() {
              assert(Object.keys(i18n._context).length === 1)
            })

            it('should include the locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context.', function() {
              assert(i18n._context[locale] === testResult)
            })
          })
        })
      })

      describe('when this._cache === true (don\'t clear cache)', function() {
        beforeEach(function() {
          i18n._cache = true
        })

        describe('when refresh', function() {
          describe('=== true (get new dictionary)', function() {
            beforeEach(function() {
              i18n.setLocale(locale, true)
            })

            it('shouldn\'t end up with current locale context only.', function() {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should include the current locale dictionary context', function() {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function() {
            beforeEach(function() {
              i18n.setLocale(locale, false)
            })

            it('shouldn\'t end up with current locale context only.', function() {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context', function() {
              assert(i18n._context[locale] === testResult)
            })
          })
        })

        describe('when this.refresh', function() {
          describe('=== true (get new dictionary)', function() {
            beforeEach(function() {
              i18n._refresh = true
              i18n.setLocale(locale)
            })

            it('shouldn\'t end up with current locale context only.', function() {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should include the current locale dictionary context', function() {
              assert(i18n._context[locale] !== opts.context[locale])
            })
          })

          describe('=== false (keep current)', function() {
            beforeEach(function() {
              i18n._refresh = false
              i18n.setLocale(locale)
            })

            it('shouldn\'t end up with current locale context only.', function() {
              assert(Object.keys(i18n._context).length === 2)
            })

            it('should have locale dictionary context', function() {
              assert(i18n._context[locale] !== undefined)
            })

            it('should keep the old dictionary context', function() {
              assert(i18n._context[locale] === testResult)
            })
          })
        })
      })
    })
  })

  describe('getLocale', function() {
    beforeEach(function() {
      i18n.configure(opts)
    })

    it('should return the \'currentLocale\'.', function() {
      var newLocale = 'it'
      i18n.setLocale(newLocale)
      assert(i18n.getLocale() === newLocale)
    })
  })

  describe('resetLocale', function() {
    var newLocale = null

    beforeEach(function() {
      i18n.configure(opts)
      newLocale = 'it'
    })

    it('should change the \'currentLocale\' to the default one.', function() {
      i18n.setLocale(newLocale)
      assert(i18n.resetLocale()._currentLocale === opts.defaultLocale)
    })
  })

  describe('setDefaultLocale', function() {
    var newLocale = null

    beforeEach(function() {
      i18n.configure(opts)
      newLocale = 'it'
    })

    it('should change the \'defaultLocale\'', function() {
      assert(i18n.setDefaultLocale(newLocale)._defaultLocale === newLocale)
    })
  })

  describe('clearCache', function() {
    beforeEach(function() {
      i18n.configure(opts)
    })

    it('should change the \'currentLocale\' to the default one.', function() {
      assert(Object.keys(i18n.clearCache()._context).length === 0)
    })
  })

  describe('refreshContext', function() {
    var testContext = {
      en: 'test 1',
      it: 'test 2'
    }

    beforeEach(function() {
      opts.defaultLocale = 'en'
      i18n.configure(opts)
      i18n._context = JSON.parse(JSON.stringify(testContext))
    })

    describe('no arguments', function() {
      msg = 'should refresh the dictionary context of current locale.'
      it(msg, function() {
        assert(i18n.refreshContext()._context.en !== testContext.en)
      })
    })

    describe('with arguments', function() {
      msg = 'should refresh the dictionary context of the locale passed '
        + 'as an argument'
      it(msg, function() {
        assert(i18n.refreshContext('it')._context.it !== testContext.it)
      })
    })
    
  })

  describe('isCached', function() {
    var noExistantLocale = 'es'

    beforeEach(function() {
      i18n.configure(opts)
    })

    msg = 'TEST RELATED: cached context should not has locale \''
      + noExistantLocale + '\''
    it(msg, function() {
      assert(opts.context[noExistantLocale] === undefined)
    })

    it('should return true if \'locale\' is cached', function() {
      assert(i18n.isCached('en'))
    })

    it('should return false if \'locale\' is not cached.', function() {
      assert(!i18n.isCached(noExistantLocale))
    })
  })

  describe('_setExtension', function() {
    it('should include a \'.\' if it isn\'t prefixed with one', function() {
      var ext = 'js'
      assert(i18n._setExtension(ext) === ('.' + ext))
    })

    msg = 'should leave the extension untouched if it is prefied with '
      + '\'.\''
    it(msg, function() {
      var ext = '.js'
      assert(i18n._setExtension(ext) === (ext))
    })
  })

  describe('_getContext', function() {
    beforeEach(function() {
      delete opts.dir
      i18n.configure(opts)
    })

    it('should return the context of the locale', function() {
      assert(i18n._getContext(opts.defaultLocale)
          === opts.context[opts.defaultLocale])
    })
  })

  describe('_translate', function() {
    var context = {}

    beforeEach(function() {
      i18n.configure(opts)
      var localeDir = path.join(__dirname, 'locale')
      context.en = JSON.parse(fs.readFileSync(localeDir + '/en.js', 'utf-8'))
      context.it = JSON.parse(fs.readFileSync(localeDir + '/it.js', 'utf-8'))
    })

    afterEach(function() {
      context = {}
    })

    describe('when path is valid', function() {
      it('should return localized phrase', function() {
        var phrase = 'greetings.text.hello'
        assert(i18n.__(phrase) === context.en.greetings.text.hello)
      })
    })

    describe('when path is invalid because', function() {
      describe('it doesn\'t exist', function() {
        it('doesn\'t exist for all locales', function() {
          var phrase = 'no.exist'
          assert(i18n.__(phrase) === phrase)
        })

        describe('exists for defaultLocale', function() {
          beforeEach
        })
      })
      
      it('is short', function() {
        var phrase = 'greetings.text'
        assert(i18n.__(phrase) === phrase)
      })
      
      it('is long', function() {
        var phrase = 'greetings.text.hello.woops'
        assert(i18n.__(phrase) === phrase)
      })

      it('f', function() {
        console.log(i18n.__n('messages', 3))
      })
    })
  })
})