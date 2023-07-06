import Canvas from "../canvas/canvas";
import Header from "../header/header";

export default class Toolbox {
  constructor() {
    this.canvasComponent = new Canvas();
    this.headerComponent = new Header();
    this.selectedTool = null;
    this.col = { r: 0, g: 0, b: 0, a: 0xff };
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

        selected = tool;
        tool.style.color = "white";
        tool.classList.add("selected");
      });
    });

    // initialize the Canvas component
    await this.canvasComponent.init();

    // bind the "this" context for the mouse events explicitly
    this.mouseUp = this.mouseUp.bind(this);
    this.mouseDown = this.mouseDown.bind(this);
    this.mouseMove = this.mouseMove.bind(this);
    this.mouseContext = this.mouseContext.bind(this);

    // add event listeners for mouse clicks on canvas
    this.canvasComponent.canvas.addEventListener("mousedown", this.mouseDown);
    this.canvasComponent.canvas.addEventListener("mouseup", this.mouseUp);
    // eslint-disable-next-line prettier/prettier
    this.canvasComponent.canvas.addEventListener("contextmenu", this.mouseContext);
  }

  // mouse events on the canvas
  mouseDown(event) {
    if (event.target !== this.canvasComponent.canvas) {
      return;
    }

    this.selectedTool = document.querySelector(".selected");
    let imageData = this.canvasComponent.getImageData();

    const canvasBoundingRect = this.canvasComponent.canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - canvasBoundingRect.left);
    const y = Math.round(event.clientY - canvasBoundingRect.top);
    this.headerComponent.undoStack.push(imageData);

    // on left-click actions per selected tool
    if (event.buttons === 1) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.hexToRgbA();
          this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.col = { r: 255, g: 255, b: 255, a: 0xff };
          this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        case this.selectedTool.classList.contains("fill"):
          this.hexToRgbA();
          this.floodFill(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        case this.selectedTool.classList.contains("brush"):
          this.hexToRgbA();
          this.brushStroke(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        default:
          break;
      }
    } else if (event.buttons === 2) {
      this.col = { r: 255, g: 255, b: 255, a: 0xff };
      this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
      this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
    }

    document.addEventListener("mousemove", this.mouseMove);
  }

  mouseMove(event) {
    if (event.target !== this.canvasComponent.canvas) {
      return;
    }

    this.selectedTool = document.querySelector(".selected");

    const canvasBoundingRect = this.canvasComponent.canvas.getBoundingClientRect();
    const x = Math.round(event.clientX - canvasBoundingRect.left);
    const y = Math.round(event.clientY - canvasBoundingRect.top);

    let imageData = this.canvasComponent.getImageData();

    // on left-click actions per selected tool
    if (event.buttons === 1) {
      switch (true) {
        case this.selectedTool.classList.contains("pencil"):
          this.hexToRgbA();
          this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        case this.selectedTool.classList.contains("eraser"):
          this.col = { r: 255, g: 255, b: 255, a: 0xff };
          this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        case this.selectedTool.classList.contains("brush"):
          this.hexToRgbA();
          this.brushStroke(imageData, this.col, x, y);
          this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
          break;
        default:
          break;
      }
    } else if (event.buttons === 2) {
      this.col = { r: 255, g: 255, b: 255, a: 0xff };
      this.canvasComponent.setColorAtPxlDrawing(imageData, this.col, x, y);
      this.canvasComponent.drawingContext.putImageData(imageData, 0, 0);
    }
  }

  mouseUp(event) {
    if (event.target !== this.canvasComponent.canvas) {
      return;
    }

    document.removeEventListener("mousemove", this.mouseMove);
  }

  mouseContext(event) {
    event.preventDefault();
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

  floodFill(imageData, newColor, x, y) {
    const { width, height } = imageData;
    const stack = [];
    const baseColor = this.canvasComponent.getColorAtPxl(imageData, x, y);

    let operator = { x, y };

    // check if the base color and the new color are the same
    if (this.colorMatch(baseColor, newColor)) {
      return;
    }

    // add the clicked position to stack
    stack.push({ x: operator.x, y: operator.y });

    // move to top most contiguousDown pixel
    while (stack.length) {
      operator = stack.pop();
      let contiguousDown = true;
      let contiguousUp = true;
      let contiguousLeft = false;
      let contiguousRight = false;

      while (contiguousUp && operator.y >= 0) {
        operator.y--;
        contiguousUp = this.colorMatch(
          this.canvasComponent.getColorAtPxl(imageData, operator.x, operator.y),
          baseColor
        );
      }

      // move downward
      while (contiguousDown && operator.y < height) {
        this.canvasComponent.setColorAtPxl(
          imageData,
          newColor,
          operator.x,
          operator.y
        );

        // check left
        if (
          operator.x - 1 >= 0 &&
          this.colorMatch(
            this.canvasComponent.getColorAtPxl(
              imageData,
              operator.x - 1,
              operator.y
            ),
            baseColor
          )
        ) {
          if (!contiguousLeft) {
            stack.push({ x: operator.x - 1, y: operator.y });
            contiguousLeft = true;
          }
        } else {
          contiguousLeft = false;
        }

        // check right
        if (
          operator.x + 1 < width &&
          this.colorMatch(
            this.canvasComponent.getColorAtPxl(
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
          this.canvasComponent.getColorAtPxl(imageData, operator.x, operator.y),
          baseColor
        );
      }
    }
  }

  brushStroke(imageData, color, x, y) {
    const { width, data } = imageData;
    const cellX = Math.floor(x / this.canvasComponent.cellPixelLength);
    const cellY = Math.floor(y / this.canvasComponent.cellPixelLength);

    for (let i = 0; i < 40; i++) {
      for (let j = 0; j < 40; j++) {
        const pixelX = cellX * this.canvasComponent.cellPixelLength + i;
        const pixelY = cellY * this.canvasComponent.cellPixelLength + j;

        data[4 * (width * pixelY + pixelX) + 0] = color.r & 0xff;
        data[4 * (width * pixelY + pixelX) + 1] = color.g & 0xff;
        data[4 * (width * pixelY + pixelX) + 2] = color.b & 0xff;
        data[4 * (width * pixelY + pixelX) + 3] = color.a & 0xff;
      }
    }
  }
}
