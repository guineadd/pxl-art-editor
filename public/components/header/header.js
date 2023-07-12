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

    // const blob = new Blob([this.pxlData], { type: "application/octet-stream" });
    // saveAs(blob, "test.pxl");
    this.generateCppFile([
      this.pxlData.slice(0, 5),
      this.pxlData.slice(5, 10),
      this.pxlData.slice(10)
    ]);
  }

  generateCppFile(chars) {
    let cppContent = "";

    chars.forEach((char, idx) => {
      const hexCharCode = `0x${(0x41 + idx).toString(16).toUpperCase()}`;

      cppContent += `// ${hexCharCode}  ${String.fromCharCode(0x41 + idx)}\n`;
      cppContent += `static const uint8_t glyph_${String.fromCharCode(
        0x41 + idx
      )}[] = {\n`;

      for (let i = 0; i < char.length; i++) {
        cppContent += `    0x${char[i].toString(16).toUpperCase()},\n`;
      }

      cppContent += `}; // Bitmap\n`;
      cppContent += `extern constexpr Bitmap bitmap_glyph_${String.fromCharCode(
        0x41 + idx
      )}(glyph_${String.fromCharCode(
        0x41 + idx
      )}, GLYPH_WIDTH, GLYPH_HEIGHT);\n\n`;
    });

    const cppFileContent = `FONT_LOCATION_FLASH\n\n${cppContent}`;
    const blob = new Blob([cppFileContent], {
      type: "text/plain;charset=utf-8"
    });

    saveAs(blob, "font.cpp");
  }
}
