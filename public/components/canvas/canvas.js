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

    // create an element to display the data as an image
    const image = new Image();
    image.src = dataURL;
    image.width = 50;
    image.height = 50;

    // append the image to the alphabet canvas container
    const alphabet = document.getElementById("alphabet");
    // alphabet.innerHTML = ""; // optional
    alphabet.appendChild(image);

    // store the pixel data into a new Uint8Array
    const imageData = this.canvas
      .getContext("2d", { willReadFrequently: true })
      .getImageData(0, 0, this.canvas.width, this.canvas.height);

    // calculate the ratio between the displayed canvas size and the defined canvas
    let actualWidth = document.getElementById("canvas-width");
    let actualHeight = document.getElementById("canvas-height");
    const widthRatio = this.canvas.width / actualWidth.value;
    const heightRatio = this.canvas.height / actualHeight.value;

    // create a new canvas with the defined size
    const actualCanvas = document.createElement("canvas");
    actualCanvas.width = actualWidth.value;
    actualCanvas.height = actualHeight.value;
    const actualContext = actualCanvas.getContext("2d");
    const actualImageData = actualContext.getImageData(
      0,
      0,
      actualWidth.value,
      actualHeight.value
    );

    // resize and copy the image data to the new canvas
    for (let y = 0; y < actualHeight.value; y++) {
      for (let x = 0; x < actualWidth.value; x++) {
        const sourceX = Math.floor(x * widthRatio);
        const sourceY = Math.floor(y * heightRatio);

        const { r, g, b, a } = this.getColorAtPxl(imageData, sourceX, sourceY);
        this.setColorAtPxl(actualImageData, { r, g, b, a }, x, y);
      }
    }

    const currPxlData = new Uint8Array(actualWidth.value * actualHeight.value); // the defined canvas' width * height (i.e. 5px * 7px = 35px)

    // extract the pixel data from the resized canvas
    for (let y = 0; y < actualHeight.value; y++) {
      for (let x = 0; x < actualWidth.value; x++) {
        const { r, g, b, a } = this.getColorAtPxl(actualImageData, x, y);
        const pxlValue = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
        currPxlData[y * 5 * x] = pxlValue;
      }
    }

    this.pxlData = this.concatUint8Arrays(this.pxlData, currPxlData);
    console.log(this.pxlData);
    console.log(actualWidth.value, actualHeight.value);

    // const currPxlData = new Uint8Array(imageData.data.length / 4);
    // let dataIdx = 0;

    // for (let i = 0; i < imageData.data.length; i += 4) {
    //   const r = imageData.data[i];
    //   const g = imageData.data[i + 1];
    //   const b = imageData.data[i + 2];
    //   const a = imageData.data[i + 3];

    //   // convert the pixel data to 0xXX form
    //   const pxlValue = ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
    //   currPxlData[dataIdx] = pxlValue;

    //   dataIdx++;
    // }

    // this.pxlData = this.concatUint8Arrays(this.pxlData, currPxlData);
  }

  concatUint8Arrays(a, b) {
    const combined = new Uint8Array(a.length + b.length);
    combined.set(a, 0);
    combined.set(b, a.length);

    return combined;
  }
}
