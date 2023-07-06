import Canvas from "../canvas/canvas";

export default class CanvasDef {
  constructor() {
    document.addEventListener("DOMContentLoaded", () => {
      this.canvasComponent = new Canvas();
      this.clearBtn = document.getElementById("clear-btn");
      this.clearBtn.addEventListener("click", this.clear);
    });
  }

  render() {}

  clear() {
    console.log(this.canvasComponent.drawingContext);
    this.canvasComponent.drawingContext.fillStyle = "#fff";
    this.canvasComponent.drawingContext.fillRect(
      0,
      0,
      this.canvasComponent.canvas.width,
      this.canvasComponent.canvas.height
    );
  }
}
