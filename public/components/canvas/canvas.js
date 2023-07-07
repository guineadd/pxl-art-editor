import { fabric } from "fabric";
import Header from "../header/header";

export default class Canvas {
  constructor() {
    this.headerComponent = new Header();
    this.canvas = null;
    this.grid = null;
    this.cellPixelLength = 0;
    this.gridSize = 25;
    this.colorInput = null;
  }

  init() {
    return new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", () => {
        this.canvas = new fabric.Canvas("canvas", {
          fireRightClick: true,
          stopContextMenu: true,
          selection: false
        });

        this.colorInput = document.getElementById("color-input");

        resolve();
      });
    });
  }

  render() {}

  saveCanvasState() {
    this.headerComponent.undoStack.push(
      JSON.stringify(this.canvas.toDatalessJSON())
    );
  }

  getColorInput() {
    return this.colorInput;
  }

  getImageData() {
    let imageData = this.drawingContext.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    return imageData;
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
}
