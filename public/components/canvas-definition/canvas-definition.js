import Canvas from "../canvas/canvas";

export default class CanvasDef {
  constructor() {
    this.canvasComponent = new Canvas();
    this.canvas = null;
    this.drawingContext = null;
    this.clearBtn = null;
    this.clear = this.clear.bind(this);
  }

  async render() {
    await this.canvasComponent.init();

    this.canvas = this.canvasComponent.canvas;
    this.drawingContext = this.canvasComponent.drawingContext;

    this.clearBtn = document.getElementById("clear-btn");
    this.clearBtn.addEventListener("click", this.clear);
  }

  clear() {
    this.drawingContext.fillStyle = "#fff";
    this.drawingContext.fillRect(
      0,
      0,
      this.canvasComponent.canvas.width,
      this.canvasComponent.canvas.height
    );
  }
}
