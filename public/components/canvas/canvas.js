import { fabric } from "fabric";
import pako from "pako";

export default class Canvas {
  constructor() {
    this.canvasContainer = null;
    this.canvas = null;
    this.alphabet = null;
    this.header = null;
    this.alphabetElement = null;
    this.grid = null;
    this.gridSize = 20;
    this.saveBtn = null;
    this.editbtn = null;
    this.removeBtn = null;
    this.counter = null;
    this.save = this.save.bind(this);
    this.edit = this.edit.bind(this);
    this.remove = this.remove.bind(this);
    this.exportData = [];
    this.savedDimensions = [];
    this.pxlData = {
      width: null,
      height: null,
      data: []
    };
    this.editData = {
      id: null,
      data: []
    };
    this.selectedDrawings = [];
    this.state = {
      draw: {
        elements: null,
        hex: null,
        counter: null,
        collectionTitle: null
      },
      edit: null
    };
    this.editState = {
      data: []
    };
    this.canvasWidth = null;
    this.canvasHeight = null;
    this.createdWidth = null;
    this.createdHeight = null;
  }

  setComponents(alphabet, header) {
    this.alphabet = alphabet;
    this.header = header;
  }

  render(width, height) {
    this.canvas = new fabric.Canvas("canvas", {
      fireRightClick: true,
      stopContextMenu: true,
      selection: false,
      backgroundColor: "rgba(255, 255, 255, 255)",
      skipTargetFind: false,
      preserveObjectStacking: true
    });

    this.grid = new fabric.StaticCanvas("grid", {
      width: width,
      height: height,
      selection: false,
      hoverCursor: "default"
    });

    this.canvasWidth = document.getElementById("canvas-width");
    this.canvasHeight = document.getElementById("canvas-height");
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

    this.canvasContainer = document.querySelector("#canvas-container .canvas");
    this.alphabetElement = document.getElementById("alphabet");
    this.saveBtn = document.getElementById("save-btn");
    this.editbtn = document.getElementById("edit-btn");
    this.removeBtn = document.getElementById("remove-btn");
    this.saveBtn.addEventListener("click", this.save);
    this.editbtn.addEventListener("click", this.edit);
    this.removeBtn.addEventListener("click", this.remove);
    this.counter = 1;
    fabric.Object.prototype.hasControls = false;
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.statefullCache = false;
    fabric.Object.prototype.noScaleCache = false;
    // fabric.Object.prototype.hasBorders = false;
    // fabric.Object.prototype.selectable = false;
    // fabric.Object.prototype.visible = false;

    this.canvasContainer.addEventListener("contextmenu", e => {
      e.preventDefault();
    });
    this.loadState();
  }

  newImage(canvas) {
    return new fabric.Image(canvas, {
      left: 0,
      top: 0,
      selectable: true,
      evented: false
    });
  }

  save() {
    const actualWidth = parseInt(this.createdWidth, 10);
    const actualHeight = parseInt(this.createdHeight, 10);

    const dimensions = {
      width: actualWidth,
      height: actualHeight
    };

    // create a temporary fabric.Canvas instance to render the fabric.js canvas content
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = actualWidth;
    tempCanvas.height = actualHeight;
    const tempContext = tempCanvas.getContext("2d");
    tempContext.drawImage(
      this.canvas.getElement(),
      0,
      0,
      actualWidth,
      actualHeight
    );

    const pxlArray = {
      id: null,
      data: []
    };
    this.pxlData.data = [];

    for (let x = 0; x < actualWidth; x++) {
      let exp = 0;
      let byte = 0;
      let byteSize = 8;

      for (let y = 0; y < actualHeight; y++) {
        const tempData = tempContext.getImageData(x, y, 1, 1).data;
        const r = tempData[0];
        const g = tempData[1];
        const b = tempData[2];
        const a = tempData[3];
        const isOn = r === 0 && g === 0 && b === 0 && a === 255;

        let bit = isOn ? 1 : 0;
        byte += bit * Math.pow(2, exp++);

        if (exp === byteSize || y === actualHeight - 1) {
          pxlArray.data.push(byte);
          byte = 0;
          exp = 0;
        }
      }
    }

    pxlArray.id = this.counter;
    this.pxlData.width = dimensions.width;
    this.pxlData.height = dimensions.height;
    this.pxlData.data.push(pxlArray);

    let duplicateData = this.exportData.findIndex(
      drawing =>
        drawing.width === this.pxlData.width &&
        drawing.height === this.pxlData.height
    );

    if (duplicateData !== -1) {
      this.exportData[duplicateData].data.push(pxlArray);
    } else if (duplicateData === -1) {
      this.exportData.push({ ...this.pxlData });
    }

    this.updateButtonState(this.alphabet.selected);

    const collectionTitle = document.getElementById("alphabetName").innerHTML;
    console.log("this.pxlData", this.pxlData);
    console.log("this.exportData", this.exportData);
    console.log("pxlArray", pxlArray);

    let saveBody = {
      hex: pxlArray,
      width: dimensions.width,
      height: dimensions.height,
      collectionTitle: collectionTitle
    };

    fetch(`/save-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(saveBody)
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
      })
      .catch(err => console.error(`Error saving data: ${err}`));
    this.counter++;
    this.paintFromDb(pxlArray);
  }

  paintFromDb(pxlArray) {
    let paintData = pxlArray.data;
    console.log(paintData);
    const canvas = document.createElement("canvas");
    canvas.width = this.pxlData.width;
    canvas.height = this.pxlData.height;
    const context = canvas.getContext("2d");

    const tempCanvas = document.createElement("canvas");
    tempCanvas.id = "temp-canvas";
    const fabricCanvas = new fabric.Canvas("temp-canvas", {
      // backgroundColor: "white"
      // preserveObjectStacking: true
    });

    for (let x = 0; x < canvas.width; x++) {
      let byteIndex = x * Math.ceil(canvas.height / 8);
      let remainingBits = 8;

      for (let y = 0; y < canvas.height; y++) {
        const bitIndex = y % 8;
        const bit = (paintData[byteIndex] >> bitIndex) & 1;

        const color = bit === 1 ? "black" : "white";
        context.fillStyle = color;
        context.fillRect(x, y, 1, 1);

        const pixel = new fabric.Rect({
          left: x * this.gridSize,
          top: y * this.gridSize,
          width: this.gridSize,
          height: this.gridSize,
          fill: color,
          evented: false
        });

        fabricCanvas.add(pixel).bringToFront(pixel);
        remainingBits--;

        if (remainingBits === 0) {
          byteIndex++;
          remainingBits = Math.min(8, canvas.height - (y + 1));
        }
      }
    }

    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = canvas.width * 25;
    scaledCanvas.height = canvas.height * 25;
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

    const dimensionsDiv = document.querySelector(
      `.size_${canvas.width}x${canvas.height}`
    );

    const imageDiv = document.createElement("div");
    imageDiv.classList.add(`image-div`, `image-${this.counter}`);
    imageDiv.style =
      "display: flex; align-items: center; justify-content: center; border: 1px solid black; width: 35px; height: 35px;";

    if (dimensionsDiv) {
      dimensionsDiv
        .querySelector(`.image-container_${canvas.width}x${canvas.height}`)
        .appendChild(imageDiv);
    } else {
      const sizeDiv = document.createElement("div");
      sizeDiv.classList.add(
        `size-div`,
        `size_${canvas.width}x${canvas.height}`,
        `enabled`
      );
      sizeDiv.style =
        "order: unset; opacity: unset; display: flex; flex-direction: column; align-items: start;";

      const dimensionsContainer = document.createElement("div");
      dimensionsContainer.classList.add(`dimensions-container`);
      dimensionsContainer.style = "display: flex; margin: 5px 0;";

      const h5 = document.createElement("h5");
      h5.innerHTML = `Size ${canvas.width} x ${canvas.height}`;

      const imageContainer = document.createElement("div");
      imageContainer.classList.add(
        `image-container_${canvas.width}x${canvas.height}`
      );
      imageContainer.style =
        "pointer-events: unset; display: flex; flex-direction: row; flex-wrap: wrap;";

      dimensionsContainer.appendChild(h5);
      sizeDiv.appendChild(dimensionsContainer);
      sizeDiv.appendChild(imageContainer);
      imageContainer.appendChild(imageDiv);
      this.alphabetElement.appendChild(sizeDiv);

      dimensionsContainer.addEventListener("click", () => {
        this.alphabet.labelOnOff(dimensionsContainer, this.exportData);
      });
    }

    imageDiv.appendChild(image);
    imageDiv.addEventListener("click", () => this.alphabet.select(imageDiv));

    this.header.exportDataObj.data.push({ id: this.counter, data: paintData });

    // sort the created div elements based on height
    const sortedDivs = Array.from(
      this.alphabetElement.getElementsByClassName("size-div")
    ).sort((a, b) => {
      const aClass = a.className.match(/size_(\d+)x(\d+)/);
      const bClass = b.className.match(/size_(\d+)x(\d+)/);

      if (aClass && aClass.length === 3 && bClass && bClass.length === 3) {
        const aHeight = parseInt(aClass[2], 10);
        const bHeight = parseInt(bClass[2], 10);

        return bHeight - aHeight;
      }

      // if there is no class name, retain the same order
      return 0;
    });

    // reorder the div elements in the alphabet
    sortedDivs.forEach(sizeDiv => {
      this.alphabetElement.appendChild(sizeDiv);
    });

    this.header.exportDataObj.width = canvas.width;
    this.header.exportDataObj.height = canvas.height;
    this.exportData.push(this.header.exportDataObj);
  }

  edit() {
    const image = this.alphabetElement.querySelector(".selected");
    const dimensions = image.parentElement.parentElement.classList[1]
      .substring(5)
      .split("x");
    const width = parseInt(dimensions[0], 10);
    const height = parseInt(dimensions[1], 10);

    this.createdWidth = width;
    this.createdHeight = height;
    this.canvasWidth.value = width;
    this.canvasHeight.value = height;

    let selection = parseInt(image.classList[1].substring(6), 10);

    this.editState.data.forEach(item => {
      if (item.id === selection) {
        this.canvas.clear();
        this.canvas.loadFromJSON(item.data, () => {
          this.canvas.forEachObject(obj => {
            obj.evented = false;

            const selected = this.canvas.getActiveObjects();
            if (selected) {
              selected.forEach(obj => {
                this.canvas.bringToFront(obj);
              });
            }
          });

          this.canvas.setDimensions({
            width: width * this.gridSize,
            height: height * this.gridSize
          });
          this.grid.setDimensions({
            width: width * this.gridSize,
            height: height * this.gridSize
          });

          this.canvas.renderAll();
        });
      }
    });
  }

  remove() {
    this.alphabet.selected.forEach(drawing => {
      // remove the selected drawings' DOM element
      const parent = drawing.parentElement.parentElement;
      let elementId = parseInt(drawing.classList[1].match(/\d+/)[0], 10);
      drawing.remove();

      // remove the selected drawings' pixel data
      this.exportData.forEach(item => {
        item.data = item.data.filter(x => x.id !== elementId);
      });

      // check pixel data and remove empty sets
      let tempData = this.exportData;
      tempData.forEach(item => {
        if (item.data.length === 0) {
          let idx = this.exportData.indexOf(item);
          this.exportData.splice(idx, 1);
        }
      });

      // check parent element for content and remove it when empty
      const drawings = parent
        .getElementsByClassName("image-container")[0]
        .getElementsByTagName("div");

      if (drawings.length === 0) {
        parent.remove();
        this.counter = 1;
      }
    });

    this.alphabet.selected.length = 0;
    this.updateButtonState(this.alphabet.selected);
    this.saveState();
  }

  updateButtonState(array) {
    if (array.length > 0) {
      this.removeBtn.style.opacity = "1";
      this.removeBtn.style.pointerEvents = "unset";
      this.editbtn.style.opacity = "1";
      this.editbtn.style.pointerEvents = "unset";
    } else {
      this.removeBtn.style.opacity = "0.5";
      this.removeBtn.style.pointerEvents = "none";
      this.editbtn.style.opacity = "0.5";
      this.editbtn.style.pointerEvents = "none";
    }
  }

  async loadState() {
    try {
      const response = await fetch(`/get-data`);
      const data = await response.json();

      this.state = {
        draw: {
          elements: JSON.parse(data[0].draw).elements,
          hex: JSON.parse(data[0].draw).hex,
          counter: JSON.parse(data[0].draw).counter,
          collectionTitle: JSON.parse(data[0].draw).collectionTitle
        },
        edit: data[0].edit
      };

      this.exportData = this.state.draw.hex === null ? [] : this.state.draw.hex;
      this.counter =
        this.state.draw.counter === null ? 1 : this.state.draw.counter;
      const compressedEditDataObj = JSON.parse(this.state.edit);
      const compressedEditDataArray = new Uint8Array(
        Object.values(compressedEditDataObj)
      );
      const decompressedEditData = pako.ungzip(compressedEditDataArray, {
        to: "string"
      });
      this.editState = JSON.parse(decompressedEditData);

      if (this.state.draw.elements && this.state.draw.elements.length > 0) {
        // clear existing content in the alphabet
        this.alphabetElement.innerHTML = "";

        // create array of div elements from state
        let array = this.state.draw.elements.map(drawing => {
          const parser = new DOMParser();
          const div = parser.parseFromString(drawing, "text/html");

          return div.body.firstChild;
        });

        // append the sorted div elements to the alphabet
        array.forEach(div => {
          this.alphabetElement.appendChild(div);

          // add event listeners only to the images within the image-container
          const images = div
            .getElementsByClassName("image-container")[0]
            .getElementsByTagName("div");

          for (const image of images) {
            image.addEventListener("click", () => this.alphabet.select(image));
          }

          let dimensions = div.childNodes[0];
          dimensions.addEventListener("click", () => {
            this.alphabet.labelOnOff(dimensions, this.exportData);
          });
        });
      }

      const selected = document.querySelector("#alphabet .selected");

      if (selected) {
        selected.classList.remove("selected");
      }

      this.updateButtonState(this.alphabet.selected);
    } catch (err) {
      console.error(`Error loading data: ${err}`);
    }
  }
}
