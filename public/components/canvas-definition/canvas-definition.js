export default class CanvasDef {
  constructor() {
    this.toolbox = null;
    this.canvas = null;
    this.clearBtn = null;
    this.clear = this.clear.bind(this);
  }

  setComponents(toolbox) {
    this.toolbox = toolbox;
  }

  async render() {
    this.canvas = this.toolbox.canvas;

    this.clearBtn = document.getElementById("clear-btn");
    this.clearBtn.addEventListener("click", this.clear);
  }

  clear() {
    this.canvas.clear();
  }
}
