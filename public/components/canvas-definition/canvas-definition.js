export default class CanvasDef {
  constructor() {
    this.toolbox = null;
    this._canvas = null;
    this.canvas = null;
    this.grid = null;
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
    this.canvas = this._canvas.canvas;
    this.grid = this._canvas.grid;
    this.gridSize = this._canvas.gridSize;

    this.canvasWidth = document.getElementById("canvas-width");
    this.canvasHeight = document.getElementById("canvas-height");

    this.clearBtn = document.getElementById("clear-btn");
    this.createBtn = document.getElementById("create-btn");
    this.clearBtn.addEventListener("click", this.clear);
    this.createBtn.addEventListener("click", this.create);

    document.addEventListener("keypress", event => {
      if (
        document.activeElement === this.canvasWidth ||
        document.activeElement === this.canvasHeight
      ) {
        if (event.key === "Enter") {
          this.create();
        }
      }
    });
  }

  clear() {
    this.toolbox.saveCanvasState();
    this.canvas.clear();
    this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
  }

  create() {
    this.canvas.clear();
    this.canvas.setDimensions({
      width: this.canvasWidth.value * this.gridSize,
      height: this.canvasHeight.value * this.gridSize
    });
    this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
    this.grid.setDimensions({
      width: this.canvasWidth.value * this.gridSize,
      height: this.canvasHeight.value * this.gridSize
    });

    this.header.undoStack = [];
    this.header.redoStack = [];
  }
}
