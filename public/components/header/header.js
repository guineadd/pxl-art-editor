import { saveAs } from "file-saver";

export default class Header {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.canvas = null;
    this._canvas = null;
    this.grid = null;
    this.gridSize = null;
    this.undoBtn = null;
    this.redoBtn = null;
    this.exportBtn = null;
    this.exportData = null;
    this.newBtn = null;
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.export = this.export.bind(this);
    this.new = this.new.bind(this);
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    this.canvas = this._canvas.canvas;
    this.grid = this._canvas.grid;
    this.gridSize = this._canvas.gridSize;

    this.undoBtn = document.getElementById("undo-btn");
    this.redoBtn = document.getElementById("redo-btn");
    this.exportBtn = document.getElementById("export-btn");
    this.newBtn = document.getElementById("new-btn");
    this.undoBtn.addEventListener("click", this.undo);
    this.redoBtn.addEventListener("click", this.redo);
    this.exportBtn.addEventListener("click", this.export);
    this.newBtn.addEventListener("click", this.new);

    document.addEventListener("keypress", event => {
      if (event.ctrlKey) {
        if (event.key === "z") {
          this.undo();
        } else if (event.key === "y") {
          this.redo();
        }
      }
    });
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

  new() {
    const modalContainer = document.getElementById("modal-container");
    const modal = document.getElementById("modal");
    const confirmBtn = document.getElementById("confirm-modal-btn");
    const cancelBtn = document.getElementById("cancel-modal-btn");

    modalContainer.removeEventListener("click", modalContainerEvent);
    document.removeEventListener("keyup", modalEvent);
    modalContainer.classList.remove("hidden");

    function modalContainerEvent(e) {
      if (!modal.contains(e.target) || e.target === cancelBtn) {
        modalContainer.classList.add("hidden");
      }
    }

    function modalEvent(e) {
      if (e.key === "Escape") {
        modalContainer.classList.add("hidden");
      }
    }

    modalContainer.addEventListener("click", modalContainerEvent);
    document.addEventListener("keyup", modalEvent);

    confirmBtn.addEventListener("click", () => {
      fetch(`/delete-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(() => {
          document.getElementById("alphabet").innerHTML = "";
          document.getElementById("canvas-width").value = 25;
          document.getElementById("canvas-height").value = 25;
          // reset canvas to initial dimensions
          this.canvas.clear();
          this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
          this.canvas.setDimensions({
            width: 25 * this.gridSize,
            height: 25 * this.gridSize
          });
          this.grid.setDimensions({
            width: 25 * this.gridSize,
            height: 25 * this.gridSize
          });

          this.undoStack = [];
          this.redoStack = [];
          // clear local storage and reinitialize state data
          localStorage.clear();
          this._canvas.exportData = [];
          this._canvas.counter = 1;
        })
        .catch(err => console.error(`Error deleting data: ${err}`));

      modalContainer.classList.add("hidden");
    });
  }

  export() {
    this.exportData = this._canvas.exportData;
    let width = document.getElementById("canvas-width");
    let height = document.getElementById("canvas-height");

    this.generateCppFile(this.exportData, width.value, height.value);
  }

  generateCppFile(data, width, height) {
    let cppContent = "";

    for (let i = 0; i < data.length; i++) {
      width = data[i].width;
      height = data[i].height;

      for (let j = 0; j < data[i].data.length; j++) {
        cppContent += `static const uint8_t glyph_${i}_${j}[] = {\n`;
        for (let k = 0; k < data[i].data[j].data.length; k++) {
          cppContent += `    0x${data[i].data[j].data[k]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")},\n`;
        }

        cppContent += `}; // Bitmap dimensions ${width}x${height} (width x height)\n`;
        cppContent += `extern constexpr Bitmap bitmap_glyph_${i}_${j}(glyph_${i}_${j}, ${width}, ${height});\n\n`;
      }
    }

    const cppFileContent = `FONT_LOCATION\n\n${cppContent}`;
    const blob = new Blob([cppFileContent], {
      type: "text/plain;charset=utf-8"
    });

    saveAs(blob, "font.cpp");
  }
}
