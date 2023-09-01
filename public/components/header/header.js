import { saveAs } from "file-saver";
import { fabric } from "fabric";

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
    this.exportDataObj = {
      width: null,
      height: null,
      data: [
        {
          id: null,
          data: []
        }
      ]
    };
    this.newBtn = null;
    this.loadBtn = null;
    this.newPressed = false;
    this.loadPressed = false;
    this.loadFile = null;
    this.alphabetElement = null;
    this.file = null;
    this.convWidth = null;
    this.convHeight = null;
    this.dataArray = [];
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.export = this.export.bind(this);
    // this.new = this.newOrLoad.bind(this);
    // this.load = this.load.bind(this);
    this.content = this.content.bind(this);
  }

  setComponents(canvas, alphabet) {
    this._canvas = canvas;
    this.alphabet = alphabet;
  }

  render() {
    this.canvas = this._canvas.canvas;
    this.grid = this._canvas.grid;
    this.gridSize = this._canvas.gridSize;

    this.undoBtn = document.getElementById("undo-btn");
    this.redoBtn = document.getElementById("redo-btn");
    this.exportBtn = document.getElementById("export-btn");
    this.newBtn = document.getElementById("new-btn");
    this.loadBtn = document.getElementById("load-btn");
    this.loadFile = document.getElementById("load-file");
    this.alphabetElement = document.getElementById("alphabet");
    this.undoBtn.addEventListener("click", this.undo);
    this.redoBtn.addEventListener("click", this.redo);
    this.exportBtn.addEventListener("click", this.export);
    this.newBtn.addEventListener("click", () => {
      this.loadPressed = false;
      this.newPressed = true;
      this.newOrLoad();
    });
    this.loadBtn.addEventListener("click", () => {
      this.newPressed = false;
      this.loadPressed = true;
      this.newOrLoad();
    });

    document.addEventListener("keydown", event => {
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

  closeModalClick(e, modal, cancel, container) {
    if (!modal.contains(e.target) || e.target === cancel) {
      container.classList.add("hidden");
      this.newPressed = false;
      this.loadPressed = false;
    }
  }

  closeModalEsc(e, container) {
    if (e.key === "Escape") {
      container.classList.add("hidden");
      this.newPressed = false;
      this.loadPressed = false;
    }
  }

  newOrLoad() {
    const modalContainer = document.getElementById("modal-container");
    const modal = document.getElementById("modal");
    const confirmBtn = document.getElementById("confirm-modal-btn");
    const cancelBtn = document.getElementById("cancel-modal-btn");
    let modalMsg = document.querySelector("#modal p");

    modalContainer.removeEventListener("click", e =>
      this.closeModalClick(e, modal, cancelBtn, modalContainer)
    );
    document.removeEventListener("keyup", e =>
      this.closeModalEsc(e, modalContainer)
    );

    if (this.newPressed) {
      modalMsg.innerHTML =
        "Are you sure you want to start a new project? All progress will be lost.";
    } else if (this.loadPressed) {
      modalMsg.innerHTML =
        "Are you sure you want to load a new file? All progress will be lost.";
    }

    modalContainer.classList.remove("hidden");

    modalContainer.addEventListener("click", e =>
      this.closeModalClick(e, modal, cancelBtn, modalContainer)
    );
    document.addEventListener("keyup", e =>
      this.closeModalEsc(e, modalContainer)
    );

    confirmBtn.addEventListener("click", async () => {
      try {
        await fetch(`/delete-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        document.getElementById("alphabet").innerHTML = "";
        // reset canvas to initial dimensions
        this.canvas.clear();
        this.canvas.backgroundColor = "rgba(255, 255, 255, 255)";
        // clear local storage and reinitialize state data
        this.undoStack = [];
        this.redoStack = [];
        localStorage.clear();
        this._canvas.exportData = [];
        this._canvas.editState = {
          data: []
        };
        this._canvas.editData = {
          id: null,
          data: []
        };
        this._canvas.counter = 1;
        if (this.newPressed) {
          if (window.innerWidth > 530) {
            this._canvas.canvasWidth.value = 25;
            this._canvas.canvasHeight.value = 25;
            this.canvas.setDimensions({
              width: 25 * this.gridSize,
              height: 25 * this.gridSize
            });
            this.grid.setDimensions({
              width: 25 * this.gridSize,
              height: 25 * this.gridSize
            });
          } else if (window.innerWidth <= 530) {
            this._canvas.canvasWidth.value = 18;
            this._canvas.canvasHeight.value = 18;
            this.canvas.setDimensions({
              width: 18 * this.gridSize,
              height: 18 * this.gridSize
            });
            this.grid.setDimensions({
              width: 18 * this.gridSize,
              height: 18 * this.gridSize
            });
          }

          this.newPressed = false;
        } else if (this.loadPressed) {
          this.load();
          this.loadPressed = false;
        }
      } catch (err) {
        console.error(`Error deleting data: ${err}`);
      }

      modalContainer.classList.add("hidden");
    });
  }

  load() {
    this.loadFile.value = "";
    this.loadFile.removeEventListener("change", this.content);
    this.loadFile.click();
    this.loadFile.addEventListener("change", this.content);
  }

  content() {
    if (this.loadFile.files.length > 0) {
      const file = this.loadFile.files[0];
      const reader = new FileReader();

      reader.onload = event => {
        const fileContent = event.target.result;

        this.file = fileContent;
        this.parseFile();
        this.file2image();
      };

      reader.readAsText(file);
    } else {
      console.error(`Please select a file.`);
    }
  }

  file2image() {
    this.exportDataObj.width = 0;
    this.exportDataObj.height = 0;
    this.exportDataObj.data = [];
    const hexData = this.dataArray;
    const canvas = document.createElement("canvas");
    canvas.width = this.convWidth;
    canvas.height = this.convHeight;
    const context = canvas.getContext("2d");

    const tempCanvas = document.createElement("canvas");
    tempCanvas.id = "temp-canvas";
    const fabricCanvas = new fabric.Canvas("temp-canvas", {
      // backgroundColor: "white"
      // preserveObjectStacking: true
    });

    let sizeDiv = `
        <div class="size-div size_${this.convWidth}x${this.convHeight} enabled" style="order: unset; opacity: unset; display: flex; flex-direction: column; align-items: start;">
            <div class="dimensions-container" style="display: flex; margin: 5px 0;"><h5>Size ${this.convWidth} x ${this.convHeight}</h5></div>
                <div class="image-container" style="pointer-events: unset; display: flex; flex-direction: row; flex-wrap: wrap;">
            </div>
        </div>
    `;
    this.alphabetElement.innerHTML = sizeDiv;
    const imageContainer = document.getElementsByClassName(
      "image-container"
    )[0];

    hexData.forEach((data, index) => {
      for (let x = 0; x < this.convWidth; x++) {
        let byteIndex = x * Math.ceil(this.convHeight / 8);
        let remainingBits = 8;

        for (let y = 0; y < this.convHeight; y++) {
          const bitIndex = y % 8;
          const bit = (data[byteIndex] >> bitIndex) & 1;

          const color = bit === 1 ? "black" : "white";
          context.fillStyle = color;
          context.fillRect(x, y, 1, 1);

          const pixel = new fabric.Rect({
            left: x * this._canvas.gridSize,
            top: y * this._canvas.gridSize,
            width: this._canvas.gridSize,
            height: this._canvas.gridSize,
            fill: color,
            evented: false
          });

          fabricCanvas.add(pixel).bringToFront(pixel);
          remainingBits--;

          if (remainingBits === 0) {
            byteIndex++;
            remainingBits = Math.min(8, this.convHeight - (y + 1));
          }
        }
      }

      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = this.convWidth * 25;
      scaledCanvas.height = this.convHeight * 25;
      const scaledContext = scaledCanvas.getContext("2d");
      scaledContext.imageSmoothingEnabled = false;
      scaledContext.drawImage(
        canvas,
        0,
        0,
        scaledCanvas.width,
        scaledCanvas.height
      );

      const dataURL = scaledCanvas.toDataURL();
      const image = new Image();
      image.src = dataURL;
      image.width = 25;
      image.height = 25;

      const tempData = JSON.stringify(fabricCanvas.toJSON());
      this._canvas.editData = {
        id: index + 1,
        data: tempData
      };
      this._canvas.editState.data.push(this._canvas.editData);

      const imageDiv = document.createElement("div");
      imageDiv.classList.add(`image-div`, `image-${this._canvas.counter}`);
      imageDiv.style =
        "display: flex; align-items: center; justify-content: center; border: 1px solid black; width: 35px; height: 35px;";
      imageContainer.appendChild(imageDiv);
      imageDiv.appendChild(image);

      imageDiv.addEventListener("click", () => this.alphabet.select(imageDiv));

      this.exportDataObj.data.push({ id: this._canvas.counter, data: data });
      this._canvas.counter++;
    });

    const dimensionsContainer = document.getElementsByClassName(
      "dimensions-container"
    );
    dimensionsContainer[0].addEventListener("click", () => {
      this.alphabet.labelOnOff(dimensionsContainer[0], this._canvas.exportData);
    });

    this.exportDataObj.width = this.convWidth;
    this.exportDataObj.height = this.convHeight;
    this._canvas.canvasWidth.value = this.convWidth;
    this._canvas.canvasHeight.value = this.convHeight;
    this._canvas.createdWidth = this._canvas.canvasWidth.value;
    this._canvas.createdHeight = this._canvas.canvasHeight.value;
    this.canvas.setDimensions({
      width: this.convWidth * this.gridSize,
      height: this.convHeight * this.gridSize
    });
    this.grid.setDimensions({
      width: this.convWidth * this.gridSize,
      height: this.convHeight * this.gridSize
    });
    this._canvas.exportData.push(this.exportDataObj);
    this._canvas.saveState();
  }

  parseFile() {
    this.dataArray = [];
    const dimensionsRegex = /\/\/ Bitmap[^)]*\b(\d+x\d+)\b[^)]*\)/;
    const dimensionsMatch = this.file.match(dimensionsRegex);
    const dimensions = dimensionsMatch ? dimensionsMatch[1] : null;
    this.convWidth = parseInt(dimensions.split("x")[0], 10);
    this.convHeight = parseInt(dimensions.split("x")[1], 10);

    const glyphRegex = /glyph_\d+x\d+/gs;
    this.file = this.file.replace(glyphRegex, "");
    const charRegex = /const uint8_t.*?};/gs;
    const matches = this.file.match(charRegex);

    if (matches) {
      for (const match of matches) {
        const hexRegex = /0[xX][0-9A-Fa-f]{2}/g;
        const hexValues = match.match(hexRegex);

        if (hexValues) {
          const values = hexValues.map(hex => parseInt(hex, 16));
          this.dataArray.push(values);
        }
      }
    }
  }

  export() {
    this.exportData = this._canvas.exportData;
    this.generateCppFile(this.exportData);
  }

  generateCppFile(data) {
    let cppContent = "";

    for (let i = 0; i < data.length; i++) {
      let width = data[i].width;
      let height = data[i].height;

      for (let j = 0; j < data[i].data.length; j++) {
        cppContent += `static const uint8_t element_${i}_${j}[] BITMAP_LOCATION_FLASH_ATTRIBUTE = {\n`;
        for (let k = 0; k < data[i].data[j].data.length; k++) {
          cppContent += `    0x${data[i].data[j].data[k]
            .toString(16)
            .toUpperCase()
            .padStart(2, "0")},\n`;
        }

        cppContent += `}; // Bitmap dimensions ${width}x${height} (width x height)\n`;
        cppContent += `extern constexpr Bitmap bitmap_element_${i}_${j}(element_${i}_${j}, ${width}, ${height});\n\n`;
      }
    }

    const cppFileContent = `BITMAP_LOCATION\n\n${cppContent}`;
    const blob = new Blob([cppFileContent], {
      type: "text/plain;charset=utf-8"
    });

    saveAs(blob, "alphabet.cpp");
  }
}
