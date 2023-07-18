import { fabric } from "fabric";

export default class Canvas {
  constructor() {
    this.canvas = null;
    this.alphabet = null;
    this.alphabetElement = null;
    this.grid = null;
    this.gridSize = 20;
    this.saveBtn = null;
    this.removeBtn = null;
    this.save = this.save.bind(this);
    this.remove = this.remove.bind(this);
    this.pxlData = [];
    this.selectedDrawings = [];
  }

  setComponents(alphabet) {
    this.alphabet = alphabet;
  }

  render(width, height) {
    this.canvas = new fabric.Canvas("canvas", {
      fireRightClick: true,
      stopContextMenu: true,
      selection: false,
      // backgroundColor: "rgba(255, 255, 255, 255)",
      skipTargetFind: false,
      preserveObjectStacking: true
    });

    this.grid = new fabric.StaticCanvas("grid", {
      width: width,
      height: height,
      selection: false,
      hoverCursor: "default"
    });

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

    this.alphabetElement = document.getElementById("alphabet");
    this.loadState();
    this.saveBtn = document.getElementById("save-btn");
    this.removeBtn = document.getElementById("remove-btn");
    this.saveBtn.addEventListener("click", this.save);
    this.removeBtn.addEventListener("click", this.remove);

    this.updateButtonState();

    fabric.Object.prototype.hasControls = false;
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = false;
    fabric.Object.prototype.statefullCache = false;
    fabric.Object.prototype.noScaleCache = false;
    // fabric.Object.prototype.hasBorders = false;
    // fabric.Object.prototype.selectable = false;
    // fabric.Object.prototype.visible = false;
  }

  // eslint-disable-next-line max-params
  addRect(left, top, fill, width = this.gridSize, height = this.gridSize) {
    let rect = new fabric.Rect({
      left: left,
      top: top,
      width: width,
      height: height,
      fill: fill,
      evented: false
    });

    this.canvas.add(rect);
  }

  getColorAtPxl(imageData, x, y) {
    const { width, data } = imageData;

    return {
      r: data[4 * (width * y + x) + 0],
      g: data[4 * (width * y + x) + 1],
      b: data[4 * (width * y + x) + 2],
      a: data[4 * (width * y + x) + 3]
    };
  }

  setColorAtPxl(imageData, color, x, y) {
    const { width, data } = imageData;

    data[4 * (width * y + x) + 0] = color.r & 0xff;
    data[4 * (width * y + x) + 1] = color.g & 0xff;
    data[4 * (width * y + x) + 2] = color.b & 0xff;
    data[4 * (width * y + x) + 3] = color.a & 0xff;
  }

  save() {
    // get the user-defined dimensions
    const actualWidth = parseInt(
      document.getElementById("canvas-width").value,
      10
    );
    const actualHeight = parseInt(
      document.getElementById("canvas-height").value,
      10
    );

    // convert the canvas to a data URL
    const dataURL = this.canvas.toDataURL();

    // create an element to display the data as an image
    const image = new Image();
    image.src = dataURL;
    image.width = actualWidth * 3;
    image.height = actualHeight * 3;

    // append the image to a newly created div element
    const newDiv = document.createElement("div");
    // eslint-disable-next-line prettier/prettier
    newDiv.style = `width: ${actualWidth * 3}px; height: ${actualHeight * 3}px; padding: 2px;`;
    newDiv.appendChild(image);

    // append the new element to the alphabet canvas container
    this.alphabetElement.appendChild(newDiv);

    // event listener to add the .selected class on click
    newDiv.addEventListener("click", () => {
      if (!newDiv.classList.contains("selected")) {
        newDiv.classList.add("selected");
        this.selectedDrawings.push(newDiv);
      } else if (newDiv.classList.contains("selected")) {
        newDiv.classList.remove("selected");
        let i = this.selectedDrawings.indexOf(newDiv);

        if (i > -1) {
          this.selectedDrawings.splice(i, 1);
        }
      }

      this.updateButtonState();
    });

    // check for an empty alphabet
    this.updateButtonState();
    // save the drawing in the browser's localStorage
    this.saveState();

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

    const pxlArray = [];

    // for (let y = 0; y < actualHeight; y++) {
    //   let row = 0;

    //   for (let x = 0; x < actualWidth; x++) {
    //     const tempData = tempContext.getImageData(x, y, 1, 1).data;
    //     const r = tempData[0];
    //     const g = tempData[1];
    //     const b = tempData[2];
    //     const a = tempData[3];
    //     const isOn = r === 0 && g === 0 && b === 0 && a === 255;

    //     row = (row << 1) | (isOn ? 1 : 0);
    //   }

    //   pxlArray.push(row);
    // }

    // for (let x = actualWidth - 1; x >= 0; x--) {
    //   let col = 0;
    //   let bitCount = 0;

    //   for (let y = actualHeight - 1; y >= 0; y--) {
    //     const tempData = tempContext.getImageData(x, y, 1, 1).data;
    //     const r = tempData[0];
    //     const g = tempData[1];
    //     const b = tempData[2];
    //     const a = tempData[3];
    //     const isOn = r === 0 && g === 0 && b === 0 && a === 255;

    //     col = (col << 1) | (isOn ? 1 : 0);
    //     bitCount++;

    //     if (bitCount === 8 || (y === 0 && bitCount > 0)) {
    //       pxlArray.push(col);
    //       col = 0;
    //       bitCount = 0;
    //     }
    //   }

    //   if (bitCount > 0) {
    //     pxlArray.push(col << (8 - bitCount));
    //   }
    // }

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
          pxlArray.push(byte);
          byte = 0;
          exp = 0;
        }
      }
    }

    // for (let x = 0; x < Math.min(actualWidth, 8); x++) {
    //   let col = 0;
    //   let bit = 0;

    //   for (let y = actualHeight; y >= 0; y--) {
    //     const tempData = tempContext.getImageData(x, y, 1, 1).data;
    //     const r = tempData[0];
    //     const g = tempData[1];
    //     const b = tempData[2];
    //     const a = tempData[3];
    //     const isOn = r === 0 && g === 0 && b === 0 && a === 255;

    //     col = (col << 1) | (isOn ? 1 : 0);
    //     bit++;

    //     if (bit === 8) {
    //       pxlArray.push(col);
    //       col = 0;
    //       bit = 0;
    //     }
    //   }

    //   for (let x = 8; x < actualWidth; x++) {
    //     const tempData = tempContext.getImageData(x, y, 1, 1).data;
    //     const r = tempData[0];
    //     const g = tempData[1];
    //     const b = tempData[2];
    //     const a = tempData[3];
    //     const isOn = r === 0 && g === 0 && b === 0 && a === 255;

    //     col = (col << 1) | (isOn ? 1 : 0);
    //     bit++;

    //     if (bit === 8 || x === actualWidth - 1) {
    //       pxlArray.push(col);
    //       col = 0;
    //       bit = 0;
    //     }
    //   }
    // }

    console.log(pxlArray);
    this.pxlData.push(pxlArray);
  }

  remove() {
    this.selectedDrawings.forEach(drawing => {
      drawing.remove();
    });

    this.selectedDrawings.length = 0;
    this.updateButtonState();
    this.saveState();
  }

  updateButtonState() {
    if (this.alphabetElement.childElementCount === 0) {
      this.removeBtn.style.opacity = "0.5";
      this.removeBtn.style.pointerEvents = "none";
    } else {
      this.removeBtn.style.opacity = "1";
      this.removeBtn.style.pointerEvents = "unset";
    }
  }

  saveState() {
    localStorage.setItem(
      "drawings",
      JSON.stringify(
        Array.from(this.alphabetElement.children).map(
          drawing => drawing.innerHTML
        )
      )
    );
  }

  loadState() {
    let state = localStorage.getItem("drawings");

    if (state) {
      let data = JSON.parse(state);

      data.forEach(item => {
        const newDiv = document.createElement("div");
        newDiv.innerHTML = item;
        this.alphabetElement.appendChild(newDiv);

        newDiv.addEventListener("click", () => {
          if (!newDiv.classList.contains("selected")) {
            newDiv.classList.add("selected");
            this.selectedDrawings.push(newDiv);
          } else if (newDiv.classList.contains("selected")) {
            newDiv.classList.remove("selected");
            let i = this.selectedDrawings.indexOf(newDiv);

            if (i > -1) {
              this.selectedDrawings.splice(i, 1);
            }
          }

          this.updateButtonState();
        });
      });
    }
  }
}
