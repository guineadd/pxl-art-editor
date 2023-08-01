export default class Toolbox {
  constructor() {
    this.header = null;
    this._canvas = null;
    this.selectedTool = null;
    this.colorInput = null;
    this.erasing = false;
    this.drawing = false;
    this.colBlack = { r: 0, g: 0, b: 0, a: 0xff };
    this.colWhite = { r: 255, g: 255, b: 255, a: 0xff };
    this.canvas = null;
    this.gridSize = null;
  }

  setComponents(header, canvas) {
    this.header = header;
    this._canvas = canvas;
  }

  render() {
    this.canvas = this._canvas.canvas;
    this.gridSize = this._canvas.gridSize;
    this.colorInput = document.getElementById("color-input");

    // bind the "this" context explicitly for the mouse events
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.objectMoving = this.objectMoving.bind(this);

    // add event listeners for mouse clicks on canvas
    this.canvas.on("mouse:down", this.mouseDown);
    this.canvas.on("mouse:move", this.mouseMove);
    this.canvas.on("mouse:up", this.mouseUp);
    this.canvas.on("object:moving", this.objectMoving);
    this.canvas.on("touch:start", this.mouseDown);
    this.canvas.on("touch:move", this.mouseMove);
    this.canvas.on("touch:end", this.mouseUp);

    const canvasDiv = document.querySelector(".canvas-box");
    document.addEventListener("click", event => {
      if (!canvasDiv.contains(event.target)) {
        this.deselectAllObjects();
      }
    });
  }

  toolSelect() {
    // pencil is by default the selected tool -- use the selected class to work with different tools
    const defaultTool = document.querySelector(".default");

    defaultTool.style.color = "white";
    defaultTool.classList.add("selected");

    const tools = document.querySelectorAll(".tools > span");
    let selected = null;

    tools.forEach(tool => {
      tool.addEventListener("click", () => {
        defaultTool.style.color = "initial";
        defaultTool.classList.remove("selected");

        if (selected !== null) {
          selected.style.color = "initial";
          selected.classList.remove("selected");
        }

        if (tool.classList.contains("select")) {
          this.canvas.selection = true;
        } else {
          this.canvas.selection = false;
        }

        selected = tool;
        tool.style.color = "white";
        tool.classList.add("selected");
      });
    });
  }

  saveCanvasState() {
    this.header.undoStack.push(JSON.stringify(this.canvas.toDatalessJSON()));
  }

  deselectAllObjects() {
    this.canvas.discardActiveObject().renderAll();
  }

  mouseDown(event) {
    this.saveCanvasState();
    this.selectedTool = document.querySelector(".selected");

    let pointer = this.canvas.getPointer(event.e);
    let gridX = Math.floor(pointer.x / this.gridSize) * this.gridSize;
    let gridY = Math.floor(pointer.y / this.gridSize) * this.gridSize;
    let x = Math.round(pointer.x);
    let y = Math.round(pointer.y);

    // check if it's a touch event
    if (event.e.type === "touchstart") {
      event.e.preventDefault();
      let touch = event.e.touches[0];
      pointer = this.canvas.getPointer(touch);
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this._canvas.addRect(gridX, gridY, this.colorInput.value);
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this._canvas.addRect(
            gridX,
            gridY,
            this.colorInput.value,
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this._canvas.addRect(gridX, gridY, "#fff");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.hexToRgbA();
          this.floodFill(this.colBlack, x, y);
          break;
        default:
          break;
      }
    }

    if (event.e.button === 2) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this._canvas.addRect(gridX, gridY, "#fff");
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this._canvas.addRect(gridX, gridY, "#fff");
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this._canvas.addRect(
            gridX,
            gridY,
            "#fff",
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.hexToRgbA();
          this.floodFill(this.colWhite, x, y);
          break;
        default:
          break;
      }
    } else if (event.e.button === 0) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this._canvas.addRect(gridX, gridY, this.colorInput.value);
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this._canvas.addRect(
            gridX,
            gridY,
            this.colorInput.value,
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this._canvas.addRect(gridX, gridY, "#fff");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.hexToRgbA();
          this.floodFill(this.colBlack, x, y);
          break;
        default:
          break;
      }
    }
  }

  mouseMove(event) {
    let pointer = this.canvas.getPointer(event.e);
    let gridX = Math.floor(pointer.x / this.gridSize) * this.gridSize;
    let gridY = Math.floor(pointer.y / this.gridSize) * this.gridSize;

    if (this.erasing) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this._canvas.addRect(gridX, gridY, "#fff");
          break;
        case this.selectedTool.classList.contains("eraser"):
          this._canvas.addRect(gridX, gridY, "#fff");
          break;
        case this.selectedTool.classList.contains("brush"):
          this._canvas.addRect(
            gridX,
            gridY,
            "#fff",
            this.gridSize * 2,
            this.gridSize * 2
          );
          break;
        default:
          break;
      }
    } else if (this.drawing) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this._canvas.addRect(gridX, gridY, this.colorInput.value);
          break;
        case this.selectedTool.classList.contains("brush"):
          this._canvas.addRect(
            gridX,
            gridY,
            this.colorInput.value,
            this.gridSize * 2,
            this.gridSize * 2
          );
          break;
        case this.selectedTool.classList.contains("eraser"):
          this._canvas.addRect(gridX, gridY, "#fff");
          break;
        default:
          break;
      }
    }
  }

  mouseUp() {
    this.drawing = false;
    this.erasing = false;
  }

  objectMoving(options) {
    options.target.set({
      left: Math.round(options.target.left / this.gridSize) * this.gridSize,
      top: Math.round(options.target.top / this.gridSize) * this.gridSize
    });
  }

  // transform color from hex to rgba
  hexToRgbA() {
    let colorInput = this.colorInput;
    let hex = colorInput.value;
    let c;

    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");

      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }

      c = `0x${c.join("")}`;
      const r = (c >> 16) & 255;
      const g = (c >> 8) & 255;
      const b = c & 255;

      this.colBlack.r = r;
      this.colBlack.g = g;
      this.colBlack.b = b;

      return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    throw new Error(`Bad Hex`);
  }

  colorMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }

  getColorAtPxl(imageData, x, y) {
    const { width, data } = imageData;

    return {
      r: data[4 * (width * y + x) + 0],
      g: data[4 * (width * y + x) + 1],
      b: data[4 * (width * y + x) + 2],
      a: data[4 * (width * y + x) + 3]
    };
  }

  setColorAtPxl(imageData, color, x, y) {
    const { width, data } = imageData;

    data[4 * (width * y + x) + 0] = color.r & 0xff;
    data[4 * (width * y + x) + 1] = color.g & 0xff;
    data[4 * (width * y + x) + 2] = color.b & 0xff;
    data[4 * (width * y + x) + 3] = color.a & 0xff;
  }

  floodFill(newColor, x, y) {
    let ctx = this.canvas
      .toCanvasElement()
      .getContext("2d", { wilLReadFrequently: true });
    let imageData = ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const { width, height } = imageData;
    const stack = [];
    const baseColor = this.getColorAtPxl(imageData, x, y);
    let operator = { x, y };

    // check if base color and new color are the same
    if (this.colorMatch(baseColor, newColor)) {
      return;
    }

    // add the clicked location to stack
    stack.push({ x: operator.x, y: operator.y });

    while (stack.length) {
      operator = stack.pop();
      let contiguousDown = true;
      let contiguousUp = true;
      let contiguousLeft = false;
      let contiguousRight = false;

      // move to top most contiguousDown pixel
      while (contiguousUp && operator.y >= 0) {
        operator.y--;
        contiguousUp = this.colorMatch(
          this.getColorAtPxl(imageData, operator.x, operator.y),
          baseColor
        );
      }

      // move downward
      while (contiguousDown && operator.y < height) {
        this.setColorAtPxl(imageData, newColor, operator.x, operator.y);

        // check left
        if (
          operator.x - 1 >= 0 &&
          this.colorMatch(
            this.getColorAtPxl(imageData, operator.x - 1, operator.y),
            baseColor
          )
        ) {
          if (!contiguousLeft) {
            contiguousLeft = true;
            stack.push({ x: operator.x - 1, y: operator.y });
          }
        } else {
          contiguousLeft = false;
        }

        // check right
        if (
          operator.x + 1 < width &&
          this.colorMatch(
            this.getColorAtPxl(imageData, operator.x + 1, operator.y),
            baseColor
          )
        ) {
          if (!contiguousRight) {
            stack.push({ x: operator.x + 1, y: operator.y });
            contiguousRight = true;
          }
        } else {
          contiguousRight = false;
        }

        operator.y++;
        contiguousDown = this.colorMatch(
          this.getColorAtPxl(imageData, operator.x, operator.y),
          baseColor
        );
      }
    }

    // create new canvas element and draw the modified imageData onto it
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    let tempCtx = tempCanvas.getContext("2d", { wilLReadFrequently: true });
    tempCtx.putImageData(imageData, 0, 0);

    // create new fabric image with new canvas as source
    let newImage = this._canvas.newImage(tempCanvas);

    // remove existing fabric object from canvas
    this.canvas.remove(this.canvas.item(0));

    // add the new fabric image to the canvas
    this.canvas.add(newImage);

    // render canvas to reflect the changes
    this.canvas.renderAll();
  }
}
