export default class Canvas {
  constructor() {
    this.canvas = null;
    this.drawingContext = null;
    this.grid = null;
    this.cellPixelLength = 0;
    this.CELL_SIDE_COUNT = 25;
    this.colorInput = null;
  }

  init() {
    return new Promise(resolve => {
      document.addEventListener("DOMContentLoaded", () => {
        /**
         * @type HTMLCanvasElement
         */
        this.canvas = document.getElementById("canvas");
        this.drawingContext = this.canvas.getContext("2d", {
          willReadFrequently: true
        });
        this.cellPixelLength = this.canvas.width / this.CELL_SIDE_COUNT;
        this.grid = document.getElementById("grid");
        this.colorInput = document.getElementById("color-input");

        this.drawingContext.fillStyle = `#fff`;
        this.drawingContext.fillRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
        let gridX = this.canvas.width / this.cellPixelLength;
        let gridY = this.canvas.height / this.cellPixelLength;

        this.grid.innerHTML = "";

        // draw grid lines
        this.grid.style.width = `${this.canvas.width}px`;
        this.grid.style.height = `${this.canvas.height}px`;
        this.grid.style.display = "grid";
        this.grid.style.gridTemplateColumns = `repeat(${gridX}, ${this.cellPixelLength}px)`;
        this.grid.style.gridTemplateRows = `repeat(${gridY}, ${this.cellPixelLength}px)`;

        for (let i = 0; i < gridX * gridY; i++) {
          const cell = document.createElement("div");
          cell.style.border = "1px solid rgba(0, 0, 0, 0.1)";
          this.grid.appendChild(cell);
        }

        resolve();
      });
    });
  }

  render() {
    // if (!this.canvas) {
    //   return;
    // }
    // this.drawingContext.fillStyle = `#fff`;
    // this.drawingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // let gridX = this.canvas.width / this.cellPixelLength;
    // let gridY = this.canvas.height / this.cellPixelLength;
    // draw grid lines
    // this.grid.style.width = `${this.canvas.width}px`;
    // this.grid.style.height = `${this.canvas.height}px`;
    // this.grid.style.gridTemplateColumns = `repeat(${gridX}, ${this.cellPixelLength}px)`;
    // this.grid.style.gridTemplateRows = `repeat(${gridY}, ${this.cellPixelLength}px)`;
    // [...Array(gridX * gridY)].forEach(() => {
    //   this.grid.insertAdjacentHTML("beforeend", "<div></div>");
    // });
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

  setColorAtPxlDrawing(imageData, color, x, y) {
    const { width, data } = imageData;
    const cellX = Math.floor(x / this.cellPixelLength);
    const cellY = Math.floor(y / this.cellPixelLength);

    for (let i = 0; i < this.cellPixelLength; i++) {
      for (let j = 0; j < this.cellPixelLength; j++) {
        const pixelX = cellX * this.cellPixelLength + i;
        const pixelY = cellY * this.cellPixelLength + j;

        data[4 * (width * pixelY + pixelX) + 0] = color.r & 0xff;
        data[4 * (width * pixelY + pixelX) + 1] = color.g & 0xff;
        data[4 * (width * pixelY + pixelX) + 2] = color.b & 0xff;
        data[4 * (width * pixelY + pixelX) + 3] = color.a & 0xff;
      }
    }
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
