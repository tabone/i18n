"use strict";

var assert  = require('assert')
  , i18n    = undefined
  , path    = require('path')
  , opts    = {}

describe('i18n-light module', function() {
  beforeEach(function() {
    i18n = require('../index')
    i18n._config = {}
    i18n._context = {}
    i18n._currentLocale = undefined
  })

  afterEach(function() {
    i18n = undefined
  })

  describe('configure method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale'),
        fallback: false
      }
    })

    it('should throw an error if \'defaultLocale\' is not set', function() {
      delete opts.defaultLocale
      assert.throws(function() {
        i18n.configure(opts)
      })
    })

    describe('\'dir\' configuration', function() {
      beforeEach(function() {
        opts.dir = path.join(__dirname, 'locale')
        opts.context = {
          'en': {
            'hello': 'hi'
          }
        }
      })

      it('should throw an error if both \'dir\' and its alternative, '
        + '\'context\', are not defined', function() {
          delete opts.dir
          delete opts.context
          assert.throws(function() {
            i18n.configure(opts)
          })
        })
    })

    it('should default the \'fallback\' value to true', function() {
      delete opts.fallback
      i18n.configure(opts)
      assert(i18n._config.fallback === true)
    })

    it('should assign the config values to the one passed as parameter.'
        , function() {
          i18n.configure(opts)

          for(var key in opts) {
            if(i18n._config[key] !== opts[key]) {
              assert(false)
            }
          }
          assert(true)
        })

    it('should assign the config values to the one passed as parameter. '
       + '- \'context\' version'
        , function() {
          delete opts.dir
          opts.context = {
            'en': {
              'message' : {
                'hello': 'hi'
              }
            }
          }

          i18n.configure(opts)

          for(var key in opts) {
            if(i18n._config[key] !== opts[key]) {
              assert(false)
            }
          }
          assert(true)
        })

    it('should include the \'context\' value to the i18n._context object'
        , function() {
          delete opts.dir
          opts.context = {
            'en': {
              'message' : {
                'hello': 'hi'
              }
            }
          }

          i18n.configure(opts)
          assert(i18n._context == opts.context)
        })

    it('should consider an empty string as not a valid config value '
      + 'for required attributes.', function() {
        opts.defaultLocale = ''
        assert.throws(function() {
          i18n.configure(opts)
        })
      })
  })

  describe('getContext method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)
      i18n._context = {}
      i18n._currentLocale = opts.defaultLocale
    })


    it('should store the dictionary of the current locale inside the '
        + '\'_context\' instance attribute.', function() {
      i18n._getContext()
      assert(i18n._context[opts.defaultLocale] !== undefined)
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

    it('should return the current locale.', function() {
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
      i18n._context['it']
    })

    it('should change the current locale to the one specified.', function() {
      i18n.setLocale('it')
      assert(i18n._currentLocale === 'it')
    })

    it('should get the context of the newly specified locale.', function() {
      i18n.setLocale('it')
      assert(i18n._context['it'] !== undefined)
    })
  })

  describe('resetLocale method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale'),
        fallback: false
      }
      i18n.configure(opts)
      i18n.setLocale('it')
    })
    it('should reset the current locale back to default local.', function() {
      i18n.resetLocale()
      assert(i18n.getLocale() === opts.defaultLocale)
    })
  })

  describe('_translate method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)

      i18n._currentLocale = opts.defaultLocale
      i18n._getContext()
    })

    describe('when current locale = default locale', function() {
      it('should return the value if the path is valid', function() {
        assert(i18n._translate('greetings.text.hello')
            === i18n._context.en.greetings.text.hello)
      })

      it('should return the path specified if the path is invalid', function() {
        assert(i18n._translate('greetings.hello')
            === 'greetings.hello')
      })
    })

    describe('when current locale <> default locale', function() {
      it('should return the value if the path is valid.', function() {
        i18n.setLocale('it')
        assert(i18n._translate('greetings.text.hello') === 'ciao')
      })

      describe('if path is invalid'
          , function() {
            describe('when \'fallback\' config is true.', function() {
              beforeEach(function() {
                i18n._config.fallback = true
              })
              it('should try to display the value of the default locale.', 
                  function() {
                    i18n.setLocale('it')
                    assert(i18n._translate('greetings.bye') === 'bye')
                  })
            }) 

            describe('when \'fallback\' config is false.', function() {
              beforeEach(function() {
                i18n._config.fallback = false
              })
              it('it should display the path specified.', 
                  function() {
                    i18n.setLocale('it')
                    assert(i18n._translate('greetings.bye') === 'greetings.bye')
                  })
            })
          })
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

    describe('when path is only provided', function() {
      it('should return the translated phrase', function() {
        assert(i18n.__('greetings.text.hello')
            === i18n._context.en.greetings.text.hello)
      })
    })

    describe('when sprintf placeholders are also provided', function() {
      it('should return', function () {
        assert(i18n.__('greetings.text.welcome', 'luca')
            === i18n._context.en.greetings.text.welcome
                .replace('%s', 'luca'))
      })
    })
  })

  describe('__n method', function() {
    beforeEach(function() {
      opts = {
        defaultLocale: 'en',
        dir: path.join(__dirname, 'locale')
      }
      i18n.configure(opts)

      i18n._currentLocale = opts.defaultLocale
      i18n._getContext()
    })

    describe('when path is only provided', function() {
      it('should return the translated phrase', function() {
        assert(i18n.__n('greetings.text.hello')
            === i18n._context.en.greetings.text.hello)
      })
    })

    describe('when last parameter is not a number', function() {
      it('should throw an error', function() {
        assert.throws(function() {
          i18n.__n('greetings.text.hello', 'text')
        })
      })
    })

    describe('when last parameter is a number', function() {
      describe('and it is == 0', function() {
        it('should return the ', function() {
          assert(i18n.__n('messages', 0) === 'No messages')
        })
      })

      describe('and it is == 1', function() {
        it('should return the ', function() {
          assert(i18n.__n('messages', 1) === '1 message')
        })
      })

      describe('and it is > 1', function() {
        it('should return the ', function() {
          assert(i18n.__n('messages', 2, 2) === '2 messages')
        })
      })
    })
  })
})