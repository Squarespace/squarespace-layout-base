const debounce = require('lodash/debounce');

const DEFAULTS = {
  resizeHandler: true,
  resizeDebounceTime: 250,
  resizeMaxWait: 2500
};

/**
 * @class  TemplateLayout
 * @description  A base module class for building Squarespace layouts
 *
 * @param  {HTMLElement} rootNode  the dom node to instantiate layout on
 * @param  {Object} config  config options
 */
class TemplateLayout {
  constructor(rootNode, config = {}) {
    // root node
    if (rootNode.nodeType !== 1) {
      throw new Error('rootNode must be a DOM Node!');
    }
    this.rootNode = rootNode;

    // rootNode's document/window
    this.document = this.rootNode.ownerDocument;
    this.window = this.document.defaultView;

    // config
    let _config = DEFAULTS;
    Object.defineProperty(this, 'config', {
      configurable: false,
      enumerable: true,
      get: () => {
        return _config;
      },
      set: (obj) => {
        _config = Object.assign({}, _config, obj);
        Object.freeze(_config);
      }
    });
    this.config = config;

    // child nodes
    this.childNodes = [];
    if (this.config.childSelector) {
      try {
        const nodes = this.rootNode.querySelectorAll(this.config.childSelector);
        this.childNodes = Array.from(nodes);
      } catch (e) {
        throw new Error('childNode error: ' + e);
      }
    }

    // resize handler
    if (this.config.resizeHandler) {
      this._boundResize = this._handleResize.bind(this);
      this._createResizeListeners();
    }

    // status
    this.hasRunInitialLayout = false;
  }

  /**
   * Creates debounced listeners for:
   *   `config.beforeResize` : `debounce(fn, leading: true, trailing: false)`
   *   `config.afterResize`  : `debounce(fn, leading: false, trailing: true)`
   */
  _createResizeListeners() {
    const beforeResize = () => {
      if (typeof this.beforeResize === 'function') {
        this.beforeResize();
      }
      if (typeof this.config.beforeResize === 'function') {
        this.config.beforeResize(this.layout.bind(this));
      }
    };
    const afterResize = () => {
      if (typeof this.afterResize === 'function') {
        this.afterResize();
      } else {
        this.layout();
      }
      if (typeof this.config.afterResize === 'function') {
        this.config.afterResize(this.layout.bind(this));
      }
    };
    this._boundBeforeResize = debounce(beforeResize, this.config.resizeDebounceTime, {
      leading: true,
      trailing: false
    });
    this._boundAfterResize = debounce(afterResize, this.config.resizeDebounceTime, {
      maxWait: this.config.resizeMaxWait,
      leading: false,
      trailing: true
    });
  }

  /**
   * Executes `config.beforeResize` on first resize event. Executes
   * `config.afterResize`, `config.resizeDebounceTime`ms after last resize event
   */
  _handleResize() {
    if (this._boundBeforeResize) {
      this._boundBeforeResize();
    }
    if (this._boundAfterResize) {
      this._boundAfterResize();
    }
  }

  /**
   * Execute`config.beforeLayout` before each layout cycle
   * @param  {object} config object with new/updated values
   */
  beforeLayout(config) {
    this.config = config;
    if (!this.hasRunInitialLayout) {
      this.beforeInitialLayout();
    }
    if (typeof this.config.beforeLayout === 'function') {
      this.config.beforeLayout.apply(this);
    }
  }

  /**
   * Executes `config.beforeInitialLayout` before initial layout cycle
   */
  beforeInitialLayout() {
    if (typeof this.config.beforeInitialLayout === 'function') {
      this.config.beforeInitialLayout.apply(this);
    }
  }

  /**
   * Executes `config.afterLayout` after each layout cycle
   */
  afterLayout() {
    if (!this.hasRunInitialLayout) {
      this.afterInitialLayout();
      this.hasRunInitialLayout = true;
    }
    if (typeof this.config.afterLayout === 'function') {
      this.config.afterLayout.apply(this);
    }
  }

  /**
   * Executes `config.afterInitialLayout` after initial layout cycle
   */
  afterInitialLayout() {
    if (typeof this.config.afterInitialLayout === 'function') {
      this.config.afterInitialLayout.apply(this);
    }
    if (this.config.resizeHandler) {
      this.window.addEventListener('resize', this._boundResize);
    }
  }

  /**
   * Executes `config.beforeDestroy` before destroying layout
   */
  beforeDestroy() {
    if (this.config.resizeHandler) {
      this.window.removeEventListener('resize', this._boundResize);
    }
    if (typeof this.config.beforeDestroy === 'function') {
      this.config.beforeDestroy.apply(this);
    }
  }

  /**
   * Executes `config.afterDestroy` after destroying layout
   */
  afterDestroy() {
    if (typeof this.config.afterDestroy === 'function') {
      this.config.afterDestroy.apply(this);
    }
  }
}


export default TemplateLayout;
