import TemplateLayout from '../src/index.js';

class Layout extends TemplateLayout {
  constructor(rootNode, config) {
    super(rootNode, config);
    this.testValue = 'yoga fire';
  }

  layout(config) {
    if (this.overwiteHook) {
      this.beforeLayout = this.overwriteBeforeLayout;
    }
    this.beforeLayout(config);
    this.afterLayout();
  }

  destroy(config) {
    this.beforeDestroy();
    this.afterDestroy();
  }

  overwriteBeforeLayout() {
    this.testValue = 'yoga flame';
    super.beforeLayout();
  }
}

module.exports = Layout;
