export default class CanvasDef {
  constructor() {
    this.toolbox = null;
    this.clearBtn = null;
    this.clear = null;
  }

  setToolbox(toolbox) {
    this.toolbox = toolbox;
  }

  async render() {
    await this.toolbox.render();
    this.clear = this.toolbox.clear.bind(this.toolbox);

    this.clearBtn = document.getElementById("clear-btn");
    this.clearBtn.addEventListener("click", this.clear);
  }

  clear() {
    this.toolbox.clear();
  }
}
