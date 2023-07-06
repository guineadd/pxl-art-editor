import "./header.css";

export default class Header {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    // this.canvasComponent = new Canvas();
    this.imageData = null;
    this.tempImageData = null;
  }

  render() {
    this.imageData = this.tempImageData;
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.tempImageData = this.canvasComponent.getImageData();
      this.redoStack.push(this.tempImageData);
      const prevState = this.undoStack.pop();
      this.tempImageData = prevState;

      this.canvasComponent.drawingContext.putImageData(prevState, 0, 0);
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.tempImageData = this.canvasComponent.getImageData();
      this.undoStack.push(this.tempImageData);
      const nextState = this.redoStack.pop();
      this.tempImageData = nextState;

      this.canvasComponent.drawingContext.putImageData(nextState, 0, 0);
    }
  }
}
