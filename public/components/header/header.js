import { saveAs } from "file-saver";
import { Buffer } from "buffer";
import Tesseract from "tesseract.js";

export default class Header {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
    this.canvas = null;
    this._canvas = null;
    this.alphabet = null;
    this.startDialog = null;
    this.grid = null;
    this.gridSize = null;
    this.undoBtn = null;
    this.redoBtn = null;
    this.exportBtn = null;
    this.exportData = null;
    this.imgRecognitionData = null;
    this.newBtn = null;
    this.undo = this.undo.bind(this);
    this.redo = this.redo.bind(this);
    this.export = this.export.bind(this);
  }

  setComponents(canvas, alphabet, startDialog) {
    this._canvas = canvas;
    this.alphabet = alphabet;
    this.startDialog = startDialog;
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
    this.newBtn.addEventListener("click", () => {
      this.newProject();
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
    }
  }

  closeModalEsc(e, container) {
    if (e.key === "Escape") {
      container.classList.add("hidden");
    }
  }

  async newProject() {
    const modalContainer = document.getElementById("modal-container");
    const modal = document.getElementById("modal");
    const confirmBtn = document.getElementById("confirm-modal-btn");
    const cancelBtn = document.getElementById("cancel-modal-btn");
    const alphabetName = document.getElementById("alphabetName");
    const alphabet = document.getElementById("alphabet");
    let modalMsg = document.querySelector("#modal p");

    modalContainer.removeEventListener("click", e =>
      this.closeModalClick(e, modal, cancelBtn, modalContainer)
    );
    document.removeEventListener("keyup", e =>
      this.closeModalEsc(e, modalContainer)
    );

    modalMsg.innerHTML = "Are you sure you want to start a new project?";

    modalContainer.classList.remove("hidden");

    modalContainer.addEventListener("click", e =>
      this.closeModalClick(e, modal, cancelBtn, modalContainer)
    );
    document.addEventListener("keyup", e =>
      this.closeModalEsc(e, modalContainer)
    );

    confirmBtn.addEventListener("click", async () => {
      modalContainer.classList.add("hidden");
      this.startDialog.startModal.classList.remove("hidden");

      alphabetName.innerHTML = "-";
      alphabet.innerHTML = "";
      this._canvas.imgRecognitionData = [];

      this._canvas.canvas.setDimensions({
        width: 25 * this._canvas.gridSize,
        height: 25 * this._canvas.gridSize
      });
      this._canvas.grid.setDimensions({
        width: 25 * this._canvas.gridSize,
        height: 25 * this._canvas.gridSize
      });
      this._canvas.canvasWidth.value = 25;
      this._canvas.canvasHeight.value = 25;
      this._canvas.createdWidth = 25;
      this._canvas.createdHeight = 25;

      this._canvas.canvas.clear();
    });
  }

  export() {
    this.exportData = this._canvas.exportData;
    this.imgRecognitionData = this._canvas.imgRecognitionData;
    this.generateCppFile(this.exportData, this.imgRecognitionData);
  }

  async generateCppFile(data, recData) {
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

        // eslint-disable-next-line no-await-in-loop
        await this.image2textRecognition(recData[j]);

        cppContent += `}; // Bitmap dimensions ${width}x${height} (width x height)\n`;
        cppContent += `extern constexpr Bitmap bitmap_element_${i}_${j}(element_${i}_${j}, ${width}, ${height});\n\n`;
      }
    }

    const cppFileContent = `BITMAP_LOCATION\n\n${cppContent}`;
    const blob = new Blob([cppFileContent], {
      type: "text/plain;charset=utf-8"
    });

    const alphabetName = document.getElementById("alphabetName");

    saveAs(blob, `${alphabetName.innerHTML}.cpp`);
  }

  async image2textRecognition(imageData) {
    const base64Data = imageData.split(",")[1];

    const image = new Image();
    image.src = `data:image/png;base64,${base64Data}`;

    return new Promise((resolve, reject) => {
      image.onload = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = image.width + 10;
        canvas.height = image.height + 10;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 5, 5);

        const paddedBase64Data = canvas.toDataURL().split(",")[1];
        const imageBuffer = Buffer.from(paddedBase64Data, "base64");

        try {
          const result = await Tesseract.recognize(imageBuffer, "eng");
          const { data } = result;

          if (data && data.text) {
            console.log(`Recognized text: ${data.text}`);
            resolve(data.text);
          } else {
            console.log(`No text recognized for the image.`);
            resolve(null);
          }
        } catch (err) {
          console.error(`Error recognizing text for the image: ${err}`);
          reject(err);
        }
      };

      image.onerror = err => {
        console.error(`Error loading image: ${err}`);
        reject(err);
      };
    });
  }
}
