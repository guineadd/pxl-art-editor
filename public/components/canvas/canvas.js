import { fabric } from "fabric";

export default class Canvas {
  constructor() {
    this.canvas = null;
    this.alphabet = null;
    this.grid = null;
    this.gridSize = 20;
    this.saveBtn = null;
    this.save = this.save.bind(this);
    this.pxlData = new Uint8Array(0);
  }

  setComponents(alphabet) {
    this.alphabet = alphabet;
  }

  render(width, height) {
    this.canvas = new fabric.Canvas("canvas", {
      fireRightClick: true,
      stopContextMenu: true,
      selection: false,
      skipTargetFind: false,
      preserveObjectStacking: true
    });

    this.grid = new fabric.StaticCanvas("grid", {
      width: width,
      height: height,
      selection: false,
      hoverCursor: "default"
    });

    let gridCellX = width / this.gridSize;
    let gridCellY = height / this.gridSize;

    for (let i = 0; i < gridCellX; i++) {
      let x = i * this.gridSize;
      this.grid.add(
        new fabric.Line([x, 0, x, height], {
          stroke: "#ddd",
          selectable: false
        })
      );
    }

    for (let j = 0; j < gridCellY; j++) {
      let y = j * this.gridSize;
      this.grid.add(
        new fabric.Line([0, y, width, y], {
          stroke: "#ddd",
          selectable: false
        })
      );
    }

    this.saveBtn = document.getElementById("save-btn");
    this.saveBtn.addEventListener("click", this.save);

    fabric.Object.prototype.hasControls = false;
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.statefullCache = false;
    fabric.Object.prototype.noScaleCache = false;
    // fabric.Object.prototype.hasBorders = false;
    // fabric.Object.prototype.selectable = false;
    // fabric.Object.prototype.visible = false;
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

  save() {
    // convert the canvas to a data URL
    const dataURL = this.canvas.toDataURL();

    // store the pixel data into a new Uint8Array
    const imageData = this.canvas
      .getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, this.canvas.width, this.canvas.height);

    const currPxlData = new Uint8Array(imageData.data);
    this.pxlData = this.concatUint8Arrays(this.pxlData, currPxlData);

    // create an element to display the data as an image
    const image = new Image();
    image.src = dataURL;
    image.width = 200;
    image.height = 50;

    // append the image to the alphabet canvas container
    const alphabet = document.getElementById("alphabet");
    // alphabet.innerHTML = ""; // optional
    alphabet.appendChild(image);
  }

  concatUint8Arrays(a, b) {
    const combined = new Uint8Array(a.length + b.length);
    combined.set(a, 0);
    combined.set(b, a.length);

    return combined;
  }
}
