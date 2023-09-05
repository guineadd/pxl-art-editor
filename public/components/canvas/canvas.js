import { fabric } from "fabric";
import pako from "pako";

export default class Canvas {
  constructor() {
    this.canvasContainer = null;
    this.canvas = null;
    this.alphabet = null;
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
    this.saveFunctionExecuted = null;
  }

  setComponents(alphabet) {
    this.alphabet = alphabet;
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
    this.saveFunctionExecuted = false;
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
    // get the user-defined dimensions
    const actualWidth = parseInt(this.createdWidth, 10);
    const actualHeight = parseInt(this.createdHeight, 10);

    const dimensions = {
      width: actualWidth,
      height: actualHeight
    };

    // filter the array to remove duplicate dimensions
    let duplicateDimensions = this.savedDimensions.findIndex(
      dim => dim.width === dimensions.width && dim.height === dimensions.height
    );

    if (!this.saveFunctionExecuted) {
      let alphabetName = document.getElementById("alphabetName");
      const timestampInSeconds = new Date()
        .getTime()
        .toString()
        .slice(-6);
      alphabetName.innerHTML = `Unsaved Collection ${timestampInSeconds}`;
      this.saveFunctionExecuted = true;
    }

    if (duplicateDimensions === -1) {
      this.savedDimensions.push(dimensions);
    } else {
      this.savedDimensions[duplicateDimensions] = dimensions;
    }

    // convert the canvas to a data URL
    const dataURL = this.canvas.toDataURL();

    // create an element to display the data as an image
    const image = new Image();
    image.src = dataURL;

    image.width = 25;
    image.height = 25;

    // save the alphabet editable data to state
    this.editData = {
      id: this.counter,
      data: JSON.stringify(this.canvas.toJSON())
    };
    this.editState.data.push(this.editData);

    // create div to contain the image
    const imageDiv = document.createElement("div");
    imageDiv.classList.add(`image-div`, `image-${this.counter}`);
    imageDiv.appendChild(image);

    // event listener to add the .selected class on click
    imageDiv.addEventListener("click", () => this.alphabet.select(imageDiv));

    // find matching div based on dimensions
    const sizeDivs = document.getElementsByClassName(
      `size_${actualWidth}x${actualHeight}`
    );

    let matching = false;

    for (const sizeDiv of sizeDivs) {
      const sizeDivImages = sizeDiv.getElementsByTagName("img");

      if (sizeDivImages.length > 0) {
        const firstImage = sizeDivImages[0];

        if (
          firstImage.width === image.width &&
          firstImage.height === image.height
        ) {
          sizeDiv
            .getElementsByClassName("image-container")[0]
            .appendChild(imageDiv);
          matching = true;
          break;
        }
      }
    }

    // if there is no match, create a new div
    if (!matching) {
      const sizeDiv = document.createElement("div");
      sizeDiv.classList.add(
        `size-div`,
        `size_${actualWidth}x${actualHeight}`,
        `enabled`
      );

      const dimensionsDiv = document.createElement("div");
      dimensionsDiv.classList.add("dimensions-container");
      dimensionsDiv.innerHTML = `<h5>Size ${actualWidth} x ${actualHeight}</h5>`;

      const imageContainerDiv = document.createElement("div");
      imageContainerDiv.classList.add("image-container");
      imageContainerDiv.appendChild(imageDiv);

      this.alphabetElement.appendChild(sizeDiv);
      sizeDiv.appendChild(dimensionsDiv);
      sizeDiv.appendChild(imageContainerDiv);

      let dimensions = sizeDiv.childNodes[0];
      dimensions.addEventListener("click", () => {
        this.alphabet.labelOnOff(dimensions, this.exportData);
      });
    }

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
    this.counter++;
    this.saveState();
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

  saveState() {
    const sizeDivs = this.alphabetElement.getElementsByClassName("size-div");
    const data = Array.from(sizeDivs).map(drawing => drawing.outerHTML);
    const compressedEditData = pako.gzip(JSON.stringify(this.editState));
    const collectionTitle = document.getElementById("alphabetName").innerHTML;
    const alphabet = document.createElement("div");
    alphabet.innerHTML = data[0];
    const imageDivs = alphabet.querySelectorAll(".image-div");
    const images = Array.from(imageDivs).map(img => img.outerHTML);

    this.state = {
      draw: {
        elements: images,
        hex: this.exportData,
        counter: this.counter,
        collectionTitle: collectionTitle
      },
      edit: JSON.stringify(compressedEditData)
    };

    fetch(`/save-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.state)
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
      })
      .catch(err => console.error(`Error saving data: ${err}`));
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
