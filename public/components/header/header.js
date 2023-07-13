import { saveAs } from "file-saver";

export default class Header {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.canvas = null;
    this._canvas = null;
    this.undoBtn = null;
    this.redoBtn = null;
    this.exportBtn = null;
    this.pxlData = null;
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.export = this.export.bind(this);
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    this.canvas = this._canvas.canvas;

    this.undoBtn = document.getElementById("undo-btn");
    this.redoBtn = document.getElementById("redo-btn");
    this.exportBtn = document.getElementById("export-btn");
    this.undoBtn.addEventListener("click", this.undo);
    this.redoBtn.addEventListener("click", this.redo);
    this.exportBtn.addEventListener("click", this.export);
  }

  undo() {
    if (this.undoStack.length > 0) {
      this.redoStack.push(JSON.stringify(this.canvas.toDatalessJSON()));
      let prev = this.undoStack.pop();
      this.canvas.clear();
      this.canvas.loadFromJSON(prev, () => {
        this.canvas.forEachObject(obj => {
          obj.selectable = true;
          obj.evented = false;
        });

        this.canvas.renderAll.bind(this.canvas);
      });
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      this.undoStack.push(JSON.stringify(this.canvas.toDatalessJSON()));
      let next = this.redoStack.pop();
      this.canvas.clear();
      this.canvas.loadFromJSON(next, () => {
        this.canvas.forEachObject(obj => {
          obj.selectable = true;
          obj.evented = false;
        });

        this.canvas.renderAll.bind(this.canvas);
      });
    }
  }

  export() {
    this.pxlData = this._canvas.pxlData;
    let width = document.getElementById("canvas-width");
    let height = document.getElementById("canvas-height");

    this.generateCppFile(this.pxlData, width.value, height.value);
  }

  generateCppFile(data, width, height) {
    let cppContent = "";
    for (let idx = 0; idx < data.length; idx++) {
      cppContent += `static const uint8_t glyph_${idx}[] = {\n`;

      for (let i = 0; i < height; i++) {
        cppContent += `    0x${data[idx][i].toString(16).toUpperCase()},\n`;
      }

      cppContent += `}; // Bitmap dimensions ${width}x${height} (width x height)\n`;
      cppContent += `extern constexpr Bitmap bitmap_glyph_${idx}(glyph_${idx}, ${width}, ${height});\n\n`;
    }

    const cppFileContent = `FONT_LOCATION\n\n${cppContent}`;
    const blob = new Blob([cppFileContent], {
      type: "text/plain;charset=utf-8"
    });

    saveAs(blob, "font.cpp");
  }
}
