"use strict";

var assert  = require('assert')
  , i18n    = require('../index')
  , path    = require('path')
  , opts    = {}

describe('i18n-light module', function() {
  describe('configure method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
    })

    it('should throw an error if \'defaultLocale\' is not set', function() {
      delete opts.defaultLocale
      assert.throws(function() {
        i18n.configure(opts)
      }, Error)
    })

    it('should throw an error if \'dir\' is not set', function() {
      delete opts.dir
      assert.throws(function() {
        i18n.configure(opts)
      }, Error)
    })

    it('should assign the value of the configuration inside the \'config\''
        + ' object', function() {
          i18n.configure(opts)
          assert((i18n._config.dir === opts.dir)
              && (i18n._config.defaultLocale === opts.defaultLocale))
        })
  })

  describe('getContext method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)
    })

    it('should include the json from the currentLocale json file inside '
        + 'the \'_context\' instance property', function() {
      i18n._currentLocale = opts.defaultLocale
      i18n._getContext()
    })
  })

  describe('getLocale method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)
    })

    it('should return the current locale', function() {
      assert(i18n.getLocale() === opts.defaultLocale)
    })
  })

  describe('setLocale method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)
    })

    it('should change the current locale to the one specified', function() {
      i18n.setLocale('it')
      assert(i18n._currentLocale === 'it')
    })

    it('should get the context of the newly specified locale', function() {
      i18n.setLocale('it')
      assert(i18n._context['it'] !== undefined)
    })
  })

  describe('__ method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)

      i18n._currentLocale = opts.defaultLocale
      i18n._getContext()
    })

    describe('when used with the default locale', function() {
      it('should return the value if the path is valid', function() {
        assert(i18n.__('greetings.text.hello')
            === i18n._context.en.greetings.text.hello)
      })

      it('should return the path specified if the path is invalid', function() {
        assert(i18n.__('greetings.hello')
            === 'greetings.hello')
      })
    })

    describe('when used with a non default locale', function() {
      it('if locale is changed, it should return the proper value for '
          + 'the locale just configured', function() {
            i18n.setLocale('it')
            assert(i18n.__('greetings.text.hello') === 'ciao')
          })

      describe('if the path doesn\'t exists inside the context of the non '
          + 'default locale', function() {
            describe('when \'fallback\' config is true', function() {
              beforeEach(function() {
                i18n._config.fallback = true
              })
              it('should try to display the value of the default one', 
                  function() {
                    i18n.setLocale('it')
                    assert(i18n.__('greetings.bye') === 'bye')
                  })
            }) 

            describe('when \'fallback\' config is false', function() {
              beforeEach(function() {
                i18n._config.fallback = false
              })
              it('it should display the path specified', 
                  function() {
                    i18n.setLocale('it')
                    assert(i18n.__('greetings.bye') === 'greetings.bye')
                  })
            })
          })
    })
  })
})