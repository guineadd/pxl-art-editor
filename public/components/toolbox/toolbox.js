import { fabric } from "fabric";
// import Canvas from "../canvas/canvas";
// import Header from "../header/header";

export default class Toolbox {
  constructor() {
    this.canvas = new fabric.Canvas("canvas", {
      fireRightClick: true,
      stopContextMenu: true,
      selection: false,
      skipTargetFind: false,
      preserveObjectStacking: true
    });

    this.grid = new fabric.StaticCanvas("grid", {
      width: this.canvas.width,
      height: this.canvas.height,
      selection: false,
      hoverCursor: "default"
    });

    this.header = null;

    this.selectedTool = null;
    this.colorInput = null;
    this.erasing = false;
    this.drawing = false;
    this.col = { r: 0, g: 0, b: 0, a: 0xff };
    this.gridSize = 25;
  }

  setHeader(header) {
    this.header = header;
  }

  async render() {
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

    this.colorInput = document.getElementById("color-input");

    let gridCellX = this.canvas.width / this.gridSize;
    let gridCellY = this.canvas.height / this.gridSize;

    for (let i = 0; i < gridCellX; i++) {
      let x = i * this.gridSize;
      this.grid.add(
        new fabric.Line([x, 0, x, this.canvas.height], {
          stroke: "#ddd",
          selectable: false
        })
      );
    }

    for (let j = 0; j < gridCellY; j++) {
      let y = j * this.gridSize;
      this.grid.add(
        new fabric.Line([0, y, this.canvas.width, y], {
          stroke: "#ddd",
          selectable: false
        })
      );
    }

    fabric.Object.prototype.hasControls = false;
    // fabric.Object.prototype.hasBorders = false;
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.statefullCache = false;
    fabric.Object.prototype.noScaleCache = false;
    // fabric.Object.prototype.selectable = false;
    // fabric.Object.prototype.visible = false;

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
    this.canvas.on("object:added", () => {
      // this.canvas.dispatchEvent(canvasChange);
    });
  }

  clear() {
    this.canvas.clear();
    // this.canvas.discardActiveObject();
    // this.canvas.renderAll();
  }

  saveCanvasState() {
    this.header.undoStack.push(JSON.stringify(this.canvas.toDatalessJSON()));
  }

  // eslint-disable-next-line max-params
  addRect(left, top, fill, width = this.gridSize, height = this.gridSize) {
    let rect = new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      fill: fill,
      evented: false
    });

    this.canvas.add(rect);
  }

  mouseDown(event) {
    this.saveCanvasState();
    this.selectedTool = document.querySelector(".selected");

    let pointer = this.canvas.getPointer(event.e);
    let gridX = Math.floor(pointer.x / this.gridSize) * this.gridSize;
    let gridY = Math.floor(pointer.y / this.gridSize) * this.gridSize;
    let x = Math.round(pointer.x);
    let y = Math.round(pointer.y);

    if (event.e.button === 2) {
      this.addRect(gridX, gridY, "#fff");
      this.erasing = true;
    } else if (event.e.button === 0) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.addRect(gridX, gridY, this.colorInput.value);
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("brush"):
          this.addRect(
            gridX,
            gridY,
            this.colorInput.value,
            this.gridSize * 2,
            this.gridSize * 2
          );
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.addRect(gridX, gridY, "#fff");
          this.drawing = true;
          break;
        case this.selectedTool.classList.contains("fill"):
          this.hexToRgbA();
          this.floodFill(this.col, x, y);
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
      this.addRect(gridX, gridY, "#fff");
    } else if (this.drawing) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.addRect(gridX, gridY, this.colorInput.value);
          break;
        case this.selectedTool.classList.contains("brush"):
          this.addRect(
            gridX,
            gridY,
            this.colorInput.value,
            this.gridSize * 2,
            this.gridSize * 2
          );
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.addRect(gridX, gridY, "#fff");
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
    let colorInput = this.canvasComponent.getColorInput();
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

      this.col.r = r;
      this.col.g = g;
      this.col.b = b;

      return `rgba(${r}, ${g}, ${b}, 1)`;
    }

    throw new Error(`Bad Hex`);
  }

  colorMatch(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }

  floodFill(newColor, x, y) {
    let canvas = this.canvas.toCanvasElement();
    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    const { width, height } = imageData;
    const stack = [];
    const baseColor = this.canvasComponent.getColorAtPxl(imageData, x, y);
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
          this.canvasComponent.getColorAtPixel(
            imageData,
            operator.x,
            operator.y
          ),
          baseColor
        );
      }

      // move downward
      while (contiguousDown && operator.y < height) {
        this.canvasComponent.setColorAtPixel(
          imageData,
          newColor,
          operator.x,
          operator.y
        );

        // check left
        if (
          operator.x - 1 >= 0 &&
          this.colorMatch(
            this.canvasComponent.getColorAtPixel(
              imageData,
              operator.x - 1,
              operator.y
            ),
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
            this.canvasComponent.getColorAtPixel(
              imageData,
              operator.x + 1,
              operator.y
            ),
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
          this.canvasComponent.getColorAtPixel(
            imageData,
            operator.x,
            operator.y
          ),
          baseColor
        );
      }
    }

    ctx.putImageData(imageData, 0, 0);
    this.canvas.clear();
    this.canvas.setBackgroundImage(
      canvas.toDataURL(),
      this.canvas.renderAll.bind(this.canvasComponent.canvas)
    );
  }
}
