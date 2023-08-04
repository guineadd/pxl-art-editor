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
    this.handleInputWidth = this.handleInputWidth.bind(this);
    this.handleInputHeight = this.handleInputHeight.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
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

    window.addEventListener("resize", this.handleWindowResize);
    this.clearBtn.addEventListener("click", this.clear);
    this.createBtn.addEventListener("click", this.create);
    this.canvasWidth.addEventListener("input", this.handleInputWidth);
    this.canvasHeight.addEventListener("input", this.handleInputHeight);

    this.boundRestrictInputWidth25 = () =>
      this.restrictInput(this.canvasWidth, 25);
    this.boundRestrictInputWidth18 = () =>
      this.restrictInput(this.canvasWidth, 18);
    this.boundRestrictInputHeight25 = () =>
      this.restrictInput(this.canvasHeight, 25);
    this.boundRestrictInputHeight18 = () =>
      this.restrictInput(this.canvasHeight, 18);

    if (window.innerWidth > 529) {
      this.canvas.clear();
      this.canvas.setDimensions({
        width: 25 * this.gridSize,
        height: 25 * this.gridSize
      });
      this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
      this.grid.setDimensions({
        width: 25 * this.gridSize,
        height: 25 * this.gridSize
      });
      this.canvasWidth.value = 25;
      this.canvasHeight.value = 25;
    } else if (window.innerWidth <= 529) {
      this.canvas.clear();
      this.canvas.setDimensions({
        width: 18 * this.gridSize,
        height: 18 * this.gridSize
      });
      this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
      this.grid.setDimensions({
        width: 18 * this.gridSize,
        height: 18 * this.gridSize
      });
      this.canvasWidth.value = 18;
      this.canvasHeight.value = 18;
    }

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

  handleInputWidth() {
    if (window.innerWidth > 529) {
      this.canvasWidth.removeEventListener(
        "input",
        this.boundRestrictInputWidth18
      );
      this.canvasWidth.addEventListener(
        "input",
        this.boundRestrictInputWidth25
      );
    } else if (window.innerWidth <= 529) {
      this.canvasWidth.removeEventListener(
        "input",
        this.boundRestrictInputWidth25
      );
      this.canvasWidth.addEventListener(
        "input",
        this.boundRestrictInputWidth18
      );
    }
  }

  handleInputHeight() {
    if (window.innerWidth > 529) {
      this.canvasHeight.removeEventListener(
        "input",
        this.boundRestrictInputHeight18
      );
      this.canvasHeight.addEventListener(
        "input",
        this.boundRestrictInputHeight25
      );
    } else if (window.innerWidth <= 529) {
      this.canvasHeight.removeEventListener(
        "input",
        this.boundRestrictInputHeight25
      );
      this.canvasHeight.addEventListener(
        "input",
        this.boundRestrictInputHeight18
      );
    }
  }

  handleWindowResize() {
    if (window.innerWidth > 529) {
      this.canvas.setDimensions({
        width: 25 * this.gridSize,
        height: 25 * this.gridSize
      });
      this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
      this.grid.setDimensions({
        width: 25 * this.gridSize,
        height: 25 * this.gridSize
      });
      this.canvasWidth.value = 25;
      this.canvasHeight.value = 25;
    } else if (window.innerWidth <= 529) {
      this.canvas.setDimensions({
        width: 18 * this.gridSize,
        height: 18 * this.gridSize
      });
      this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
      this.grid.setDimensions({
        width: 18 * this.gridSize,
        height: 18 * this.gridSize
      });
      this.canvasWidth.value = 18;
      this.canvasHeight.value = 18;
    }
  }

  restrictInput(input, limitValue) {
    input.value = input.value.replace(/^0+|[^0-9]/g, "");
    if (input.value > limitValue) {
      input.value = limitValue;
    }
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
