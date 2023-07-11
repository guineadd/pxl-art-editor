export default class CanvasDef {
  constructor() {
    this.toolbox = null;
    this._canvas = null;
    this.canvas = null;
    this.header = null;
    this.gridSize = null;
    this.clearBtn = null;
    this.createBtn = null;
    this.canvasWidth = null;
    this.canvasHeight = null;
    this.clear = this.clear.bind(this);
    this.create = this.create.bind(this);
  }

  setComponents(toolbox, canvas, header) {
    this.toolbox = toolbox;
    this._canvas = canvas;
    this.header = header;
  }

  render() {
    this.canvas = this.toolbox.canvas;
    this.gridSize = this.toolbox.gridSize;

    this.canvasWidth = document.getElementById("canvas-width");
    this.canvasHeight = document.getElementById("canvas-height");

    this.clearBtn = document.getElementById("clear-btn");
    this.createBtn = document.getElementById("create-btn");
    this.clearBtn.addEventListener("click", this.clear);
    this.createBtn.addEventListener("click", this.create);
  }

  clear() {
    this.toolbox.saveCanvasState();
    this.canvas.clear();
  }

  create() {
    if (this._canvas.canvas) {
      this._canvas.canvas.dispose();
      this._canvas.canvas = null;
    }

    this._canvas.render(
      this.canvasWidth.value * this.gridSize,
      this.canvasHeight.value * this.gridSize
    );
    this._canvas.canvas.setWidth(this.canvasWidth.value * this.gridSize);
    this._canvas.canvas.setHeight(this.canvasHeight.value * this.gridSize);

    this.toolbox.render();
    this.header.render();
    this.header.undoStack = [];
    this.header.redoStack = [];
    this.render();
  }
}
