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

    this.clearBtn = document.getElementById("clear-btn");
    this.createBtn = document.getElementById("create-btn");

    window.addEventListener("resize", this.handleWindowResize);
    this.clearBtn.addEventListener("click", this.clear);
    this.createBtn.addEventListener("click", this.create);
    this._canvas.canvasWidth.addEventListener("input", this.handleInputWidth);
    this._canvas.canvasHeight.addEventListener("input", this.handleInputHeight);

    this.boundRestrictInputWidth25 = () =>
      this.restrictInput(this._canvas.canvasWidth, 25);
    this.boundRestrictInputWidth18 = () =>
      this.restrictInput(this._canvas.canvasWidth, 18);
    this.boundRestrictInputHeight25 = () =>
      this.restrictInput(this._canvas.canvasHeight, 25);
    this.boundRestrictInputHeight18 = () =>
      this.restrictInput(this._canvas.canvasHeight, 18);

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
      this._canvas.createdWidth = 25;
      this._canvas.createdHeight = 25;
      this._canvas.canvasWidth.value = 25;
      this._canvas.canvasHeight.value = 25;
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
      this._canvas.createdWidth = 18;
      this._canvas.createdHeight = 18;
      this._canvas.canvasWidth.value = 18;
      this._canvas.canvasHeight.value = 18;
    }

    document.addEventListener("keypress", event => {
      if (
        document.activeElement === this._canvas.canvasWidth ||
        document.activeElement === this._canvas.canvasHeight
      ) {
        if (event.key === "Enter") {
          this.create();
        }
      }
    });
  }

  handleInputWidth() {
    if (window.innerWidth > 529) {
      this._canvas.canvasWidth.removeEventListener(
        "input",
        this.boundRestrictInputWidth18
      );
      this._canvas.canvasWidth.addEventListener(
        "input",
        this.boundRestrictInputWidth25
      );
    } else if (window.innerWidth <= 529) {
      this._canvas.canvasWidth.removeEventListener(
        "input",
        this.boundRestrictInputWidth25
      );
      this._canvas.canvasWidth.addEventListener(
        "input",
        this.boundRestrictInputWidth18
      );
    }
  }

  handleInputHeight() {
    if (window.innerWidth > 529) {
      this._canvas.canvasHeight.removeEventListener(
        "input",
        this.boundRestrictInputHeight18
      );
      this._canvas.canvasHeight.addEventListener(
        "input",
        this.boundRestrictInputHeight25
      );
    } else if (window.innerWidth <= 529) {
      this._canvas.canvasHeight.removeEventListener(
        "input",
        this.boundRestrictInputHeight25
      );
      this._canvas.canvasHeight.addEventListener(
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
      this._canvas.createdWidth = 25;
      this._canvas.createdHeight = 25;
      this._canvas.canvasWidth.value = 25;
      this._canvas.canvasHeight.value = 25;
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
      this._canvas.createdWidth = 18;
      this._canvas.createdHeight = 18;
      this._canvas.canvasWidth.value = 18;
      this._canvas.canvasHeight.value = 18;
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
      width: this._canvas.canvasWidth.value * this.gridSize,
      height: this._canvas.canvasHeight.value * this.gridSize
    });
    this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
    this.grid.setDimensions({
      width: this._canvas.canvasWidth.value * this.gridSize,
      height: this._canvas.canvasHeight.value * this.gridSize
    });

    this._canvas.createdWidth = this._canvas.canvasWidth.value;
    this._canvas.createdHeight = this._canvas.canvasHeight.value;
    this.header.undoStack = [];
    this.header.redoStack = [];
  }
}
