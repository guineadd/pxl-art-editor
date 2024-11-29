import { fabric } from "fabric";

export default class Toolbox {
  constructor() {
    this.header = null;
    this._canvas = null;
    this.selectedTool = null;
    this.erasing = false;
    this.drawing = false;
    this.canvas = null;
    this.gridSize = null;
    this.existingRectPositions = [];
  }

  setComponents(header, canvas) {
    this.header = header;
    this._canvas = canvas;
  }

  render() {
    this.canvas = this._canvas.canvas;
    this.gridSize = this._canvas.gridSize;

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

    defaultTool.style.color = "#fff";
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
        tool.style.color = "#fff";
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

   
  addRectangle(left, top, fill, width = this.gridSize, height = this.gridSize) {
    const isPositionOccupied = this.existingRectPositions.some(position => {
      return position.left === left && position.top === top;
    });

    if (!isPositionOccupied) {
      let rect = new fabric.Rect({
        left: left,
        top: top,
        width: width,
        height: height,
        fill: fill,
        evented: false
      });

      this._canvas.canvas.add(rect);

      this.existingRectPositions.push({ left, top });
    }
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
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#000");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this.existingRectPositions = [];
          this.addRectangle(
            gridX,
            gridY,
            "#000",
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#fff");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.floodFill("#000", x, y);
          break;
        default:
          break;
      }
    }

    if (event.e.button === 2) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#fff");
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#fff");
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this.existingRectPositions = [];
          this.addRectangle(
            gridX,
            gridY,
            "#fff",
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.erasing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.floodFill("#fff", x, y);
          break;
        default:
          break;
      }
    } else if (event.e.button === 0) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#000");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this.existingRectPositions = [];
          this.addRectangle(
            gridX,
            gridY,
            "#000",
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.existingRectPositions = [];
          this.addRectangle(gridX, gridY, "#fff");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.floodFill("#000", x, y);
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
          this.addRectangle(gridX, gridY, "#fff");
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.addRectangle(gridX, gridY, "#fff");
          break;
        case this.selectedTool.classList.contains("brush"):
          this.addRectangle(
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
          this.addRectangle(gridX, gridY, "#000");
          break;
        case this.selectedTool.classList.contains("brush"):
          this.addRectangle(
            gridX,
            gridY,
            "#000",
            this.gridSize * 2,
            this.gridSize * 2
          );
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.addRectangle(gridX, gridY, "#fff");
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
      top: Math.round(options.target.top / this.gridSize) * this.gridSize,
      right:
        Math.round(options.target.left / this.gridSize) * this.gridSize +
        options.target.width,
      bottom:
        Math.round(options.target.top / this.gridSize) * this.gridSize +
        options.target.height
    });

    this._canvas.canvas.bringToFront(options.target);
  }

  colorMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }

  getColorAtPxl(x, y) {
    const ctx = this._canvas.canvas.getContext("2d");
    const pixel = ctx.getImageData(x, y, 1, 1).data;

    return {
      r: pixel[0],
      g: pixel[1],
      b: pixel[2],
      a: pixel[3]
    };
  }

  floodFill(newColor, x, y) {
    const baseColor = this.getColorAtPxl(x, y);
    if (this.colorMatch(baseColor, newColor)) {
      return;
    }

    const stack = [];
    const processed = new Set();
    stack.push({ x, y });

    while (stack.length) {
      const operator = stack.pop();
      const pxlColor = this.getColorAtPxl(operator.x, operator.y);
      if (
        !this.colorMatch(pxlColor, baseColor) ||
        processed.has(`${operator.x}-${operator.y}`)
      ) {
        continue;
      }

      processed.add(`${operator.x}-${operator.y}`);

      const rect = new fabric.Rect({
        left: Math.floor(operator.x / this.gridSize) * this.gridSize,
        top: Math.floor(operator.y / this.gridSize) * this.gridSize,
        width: this.gridSize,
        height: this.gridSize,
        fill: newColor,
        selectable: true,
        evented: false
      });

      this._canvas.canvas.add(rect);

      stack.push({ x: operator.x + this.gridSize, y: operator.y });
      stack.push({ x: operator.x - this.gridSize, y: operator.y });
      stack.push({ x: operator.x, y: operator.y + this.gridSize });
      stack.push({ x: operator.x, y: operator.y - this.gridSize });
    }

    this._canvas.canvas.renderAll();
  }
}
