const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');

const assert = require('chai').assert;
const expect = require('chai').expect;

const Layout = require(path.join(__dirname, 'layout.js'));

const DEFAULTS = {
  resizeHandler: true,
  resizeDebounceTime: 250,
  resizeMaxWait: 2500
};

describe('TemplateLayout', function() {

  // BOOTSTRAP
  const noop = function() {}
  let window, document, rootNode;

  const parseDocument = (error, win, done) => {
    window = win;
    document = win.document;
    rootNode = win.document.querySelector('.root-node');
    done();
  };

  beforeEach(function(done) {
    jsdom.env({
      file: path.join(__dirname, 'layout.html'),
      parsingMode: 'html',
      done: function(error, win) {
        if (error) done(error);
        parseDocument(error, win, done);
      }
    });
  });

  afterEach(function() {
    window.close();
    [window, document, rootNode] = Array(3).fill(null);
  });



  // TESTS


  // nodes
  describe('#nodes', function() {
    it('should create rootNode property', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      assert.equal(layout.rootNode, rootNode);
    });

    it('should fail if rootNode argument is not a node', function() {
      function throwRootNodeError() {
        new Layout('Dick Butkus');
      }
      expect(throwRootNodeError).to.throw(Error);
    });

    it('should create document and window properties', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      assert.equal(layout.document, document);
      assert.equal(layout.window, window);
    });

    it('should create empty childNodes array by default', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      assert.equal(layout.childNodes.length, 0);
    });

    it('should not throw an error if childNode selector is mistyped', function() {
      const layout = new Layout(rootNode, { resizeHandler: false, 'childSelector': 'ooooohhh-child' });
      assert.equal(layout.childNodes.length, 0);
    });

    it('should throw an error if childNode selector is not a string', function() {
      function throwChildSelectorError() {
        const thingsAreGonnaGetEasier = {};
        new Layout(rootNode, { resizeHandler: false, 'childSelector': thingsAreGonnaGetEasier });
      }
      expect(throwChildSelectorError).to.throw(Error);
    });

    it('should create childNodes if valid selector is present', function() {
      const layout = new Layout(rootNode, { resizeHandler: false, 'childSelector': '.child-node' });
      assert.equal(layout.childNodes.length, 3);
    });
  });


  // config
  describe('#config', function() {
    it('should create default values', function() {
      const layout = new Layout(rootNode);
      Object.keys(DEFAULTS).forEach(key => {
        assert.equal(layout.config[key], DEFAULTS[key]);
      });
    });

    it('should create arbitrary config value', function() {
      const propVal = 'yes you can';
      const layout = new Layout(rootNode, { resizeHandler: false, canIkickIt: propVal });
      assert.equal(layout.config.canIkickIt, propVal);
    });

    it('should overwrite default values', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      assert.isFalse(layout.config.resizeHandler);
    });

    it('should not throw an error when nothing is passed to layout', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      function dontThrowLayoutArgumentError() {
        layout.layout();
      }
      expect(dontThrowLayoutArgumentError).not.to.throw(Error);
    });

    it('should merge new config values when passed to layout', function() {
      const layout = new Layout(rootNode, { custom: 'firstVal' });
      assert.isTrue(layout.config.resizeHandler);
      assert.equal(layout.config.custom, 'firstVal');
      layout.layout({
        resizeHandler: false,
        custom: 'secondVal'
      });
      assert.isFalse(layout.config.resizeHandler);
      assert.equal(layout.config.custom, 'secondVal');
    });
  });


  // hooks
  describe('#hooks', function() {
    it('should set hasRunInitialLayout to false on init', function() {
      const layout = new Layout(rootNode, { resizeHandler: false });
      assert.isFalse(layout.hasRunInitialLayout);
    });

    it('should set hasRunInitialLayout to true after initial layout', function() {
      const layout = new Layout(rootNode, { resizeHandler: false, afterInitialLayout: noop });
      assert.isFalse(layout.hasRunInitialLayout);
      layout.layout();
      assert.isTrue(layout.hasRunInitialLayout);
    });

    it('should execute beforeLayout callback', function() {
      const barksdales = ['avon', 'dangelo', 'string', 'slim charles', 'bodie', 'pooh', 'wallace'];
      function killWallace() {
        barksdales.pop();
      }
      const layout = new Layout(rootNode, { resizeHandler: false, beforeLayout: killWallace });
      expect(barksdales[barksdales.length - 1]).to.equal('wallace');
      layout.layout();
      expect(barksdales[barksdales.length - 1]).to.equal('pooh');
    });

    it('should execute beforeInitialLayout callback once on first layout cycle', function() {
      const fighters = ['blanka', 'chunli', 'dhalsim', 'ehonda', 'guile', 'zangief'];
      let index = 0;
      function beforeInitialLayout() {
        index++;
      }
      const layout = new Layout(rootNode, { resizeHandler: false, beforeInitialLayout });
      assert.equal(fighters[index], 'blanka');
      layout.layout();
      assert.equal(fighters[index], 'chunli');
      layout.layout();
      assert.equal(fighters[index], 'chunli');
    });

    it('should execute afterLayout callback', function() {
      let whatYouCanGetWith = 'this';
      function afterLayout() {
        whatYouCanGetWith = 'that';
      }
      const layout = new Layout(rootNode, { resizeHandler: false, afterLayout });
      expect(whatYouCanGetWith).to.equal('this');
      layout.layout();
      expect(whatYouCanGetWith).to.equal('that');
    });

    it('should execute afterInitialLayout callback once on first layout cycle', function() {
      const films = ['death blow', 'chunnel', 'prognosis negative', 'sack lunch'];
      let index = 0;
      function afterInitialLayout() {
        index++;
      }
      const layout = new Layout(rootNode, { resizeHandler: false, afterInitialLayout });
      assert.equal(films[index], 'death blow');
      layout.layout();
      assert.equal(films[index], 'chunnel');
      layout.layout();
      assert.equal(films[index], 'chunnel');
    });

    it('should execute beforeDestroy callback', function() {
      let whatYouCanGetWith = 'this';
      function beforeDestroy() {
        whatYouCanGetWith = 'that';
      }
      const layout = new Layout(rootNode, { resizeHandler: false, beforeDestroy });
      expect(whatYouCanGetWith).to.equal('this');
      layout.destroy();
      expect(whatYouCanGetWith).to.equal('that');
    });

    it('should execute afterDestroy callback', function() {
      let whatYouCanGetWith = 'this';
      function afterDestroy() {
        whatYouCanGetWith = 'that';
      }
      const layout = new Layout(rootNode, { resizeHandler: false, afterDestroy });
      expect(whatYouCanGetWith).to.equal('this');
      layout.destroy();
      expect(whatYouCanGetWith).to.equal('that');
    });

    it('should overwrite hook methods and not execute callback', function() {
      let whatYouCanGetWith = 'this';
      function overwriteBeforeLayout() {
        whatYouCanGetWith = 'this again';
      }
      function beforeLayout() {
        whatYouCanGetWith = 'that';
      }
      const layout = new Layout(rootNode, { resizeHandler: false, beforeLayout });
      layout.layout();
      expect(whatYouCanGetWith).to.equal('that');
      layout.beforeLayout = overwriteBeforeLayout;
      layout.layout();
      expect(whatYouCanGetWith).to.equal('this again');
    });
  });


  // resize handler
  describe('#resize', function() {
    it('should fail silently on handleResize when no resize callbacks are present', function() {
      const layout = new Layout(rootNode);
      expect(layout._handleResize).not.to.throw;
    });

    it('should create afterResize method by default', function() {
      const layout = new Layout(rootNode);
      expect(typeof layout._boundAfterResize).to.equal('function');
    });

    it('should not create beforeResize and afterResize methods if config.resizeHandler is false', function() {
      const layout = new Layout(rootNode, { resizeHandler: false, beforeResize: noop, afterResize: noop });
      expect(typeof layout._boundBeforeResize).to.equal('undefined');
      expect(typeof layout._boundAfterResize).to.equal('undefined');
    });

    it('should create debounced beforeResize function when config.beforeResize is passed', function() {
      const layout = new Layout(rootNode, { beforeResize: noop });
      expect(typeof layout._boundBeforeResize).to.equal('function');
    });

    it('should create debounced afterResize function when config.afterResize is passed', function() {
      const layout = new Layout(rootNode, { afterResize: noop });
      expect(typeof layout._boundAfterResize).to.equal('function');
    });
  });

});