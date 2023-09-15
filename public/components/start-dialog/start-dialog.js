export default class StartDialog {
  constructor() {
    this._canvas = null;
    this.startModal = null;
    this.newCollection = null;
    this.loadFromFile = null;
    this.loadFromDb = null;
    this.newCollectionModal = null;
    this.loadFileCollectionModal = null;
    this.loadDbCollectionModal = null;
    this.collections = null;
    this.collectionHandler = [];
    this.editIconHandler = [];
    this.delIconHandler = [];
    this.enterKeyHandler = [];
    this.inputFocusOutHandler = [];
    this.collectionId = [];
    this.collectionNames = [];
    this.currentSelection = null;
    this.fileInput = null;
    this.file = null;
    this.dataArray = null;
    this.collectionNameLoad = null;
    this.characterIds = null;
    this.loadedWidth = null;
    this.loadedHeight = null;
    this.fileContent = this.fileContent.bind(this);
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    this.startModal = document.getElementById("start-modal-container");
    this.newCollectionModal = document.getElementById(
      "new-collection-container"
    );
    this.loadFileCollectionModal = document.getElementById(
      "load-file-collection-container"
    );
    this.loadDbCollectionModal = document.getElementById(
      "load-db-collection-container"
    );
    this.newCollection = document.getElementById("newCollection");
    this.loadFromFile = document.getElementById("loadFromFile");
    this.loadFromDb = document.getElementById("loadFromDb");

    this.newCollection.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.newCollectionModal.classList.remove("hidden");
      this.saveCollection();
    });

    this.loadFromFile.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.loadFileCollectionModal.classList.remove("hidden");
      this.loadCollection();
    });

    this.loadFromDb.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.loadDbCollectionModal.classList.remove("hidden");
      this.loadCollectionsFromDb();
    });

    this.currentSelection = -1;
  }

  async saveCollection() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    const collectionContainer = document.getElementById(
      "new-collection-container"
    );
    const collectionName = document.getElementById("collection-name");
    const confirmSaveBtn = document.getElementById("confirm-save-modal-btn");
    const cancelSaveBtn = document.getElementById("cancel-save-modal-btn");
    const inputAlert = document.getElementById("new-input-alert");
    const alphabetName = document.getElementById("alphabetName");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    collectionName.focus();
    inputAlert.classList.add("hidden");
    collectionName.value = "";

    collectionName.addEventListener("input", () => {
      confirmSaveBtn.disabled = !collectionName.value;
    });

    confirmSaveBtn.addEventListener("click", async () => {
      if (validFilenameRegex.test(collectionName.value)) {
        const duplicate = this.collections.find(
          item => collectionName.value === item.CollectionName
        );

        if (!duplicate) {
          fetch("/save-collection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ collectionName: collectionName.value })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
            })
            .catch(err => console.error(`Error creating collection: ${err}`));

          alphabetName.innerHTML = collectionName.value;
          collectionContainer.classList.add("hidden");
        } else if (duplicate) {
          inputAlert.classList.remove("hidden");
          inputAlert.innerHTML =
            "There already exists a collection with the same name. Please choose a different name.";
          collectionName.focus();
        }
      } else {
        inputAlert.innerHTML =
          "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
        inputAlert.classList.remove("hidden");
        console.log("Invalid filename. Please enter a valid filename.");
      }
    });

    cancelSaveBtn.addEventListener("click", async () => {
      collectionContainer.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  async loadCollection() {
    const response = await fetch("/collections");
    this.collections = await response.json();
    const collectionContainer = document.getElementById(
      "load-file-collection-container"
    );
    const collectionName = document.getElementById("load-file-collection-name");
    const confirmBtn = document.getElementById("confirm-load-file-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-file-modal-btn");
    const inputAlert = document.getElementById("load-file-input-alert");
    this.fileInput = document.getElementById("start-modal-load-file");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    const fileDialog = () => {
      if (validFilenameRegex.test(collectionName.value)) {
        const duplicate = this.collections.find(
          item => collectionName.value === item.CollectionName
        );
        if (!duplicate) {
          this.collectionNameLoad = collectionName.value;
          this.fileInput.removeEventListener("change", this.fileContent);
          this.fileInput.click();
          this.fileInput.addEventListener("change", this.fileContent);
        } else if (duplicate) {
          inputAlert.classList.remove("hidden");
          inputAlert.innerHTML =
            "There already exists a collection with the same name. Please choose a different name.";
          collectionName.focus();
        }
      } else {
        inputAlert.innerHTML =
          "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
        inputAlert.classList.remove("hidden");
        console.log("Invalid filename. Please enter a valid filename.");
      }
    };

    collectionName.focus();
    inputAlert.classList.add("hidden");
    collectionName.value = "";

    collectionName.addEventListener("input", () => {
      confirmBtn.disabled = !collectionName.value;
    });

    confirmBtn.addEventListener("click", fileDialog);

    cancelBtn.addEventListener("click", async () => {
      confirmBtn.removeEventListener("click", fileDialog);
      collectionContainer.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  fileContent() {
    if (this.fileInput.files.length > 0) {
      const collectionContainer = document.getElementById(
        "load-file-collection-container"
      );
      const alphabetName = document.getElementById("alphabetName");

      const file = this.fileInput.files[0];
      const reader = new FileReader();

      reader.onload = event => {
        const fileContent = event.target.result;

        this.file = fileContent;
        collectionContainer.classList.add("hidden");
        alphabetName.innerHTML = this.collectionNameLoad;

        this.parseFile();
        this.saveHexToDb();
      };

      reader.readAsText(file);
    } else {
      console.error(`Please select a file.`);
    }
  }

  parseFile() {
    this.dataArray = [];
    const dimensionsRegex = /\/\/ Bitmap[^)]*\b(\d+x\d+)\b[^)]*\)/;
    const dimensionsMatch = this.file.match(dimensionsRegex);
    const dimensions = dimensionsMatch ? dimensionsMatch[1] : null;
    this.loadedWidth = parseInt(dimensions.split("x")[0], 10);
    this.loadedHeight = parseInt(dimensions.split("x")[1], 10);

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

  async saveHexToDb() {
    let saveBody = {
      hex: this.dataArray,
      width: this.loadedWidth,
      height: this.loadedHeight,
      collectionTitle: this.collectionNameLoad
    };

    await fetch(`/save-multiple-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(saveBody)
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        this.characterIds = data.characterIds;
        this.paintMultipleFromDb();
      })
      .catch(err => console.error(`Error saving data: ${err}`));
  }

  paintMultipleFromDb() {
    this._canvas.canvas.setDimensions({
      width: this.loadedWidth * this._canvas.gridSize,
      height: this.loadedHeight * this._canvas.gridSize
    });
    this._canvas.grid.setDimensions({
      width: this.loadedWidth * this._canvas.gridSize,
      height: this.loadedHeight * this._canvas.gridSize
    });
    this._canvas.canvasWidth.value = this.loadedWidth;
    this._canvas.canvasHeight.value = this.loadedHeight;
    this._canvas.createdWidth = this.loadedWidth;
    this._canvas.createdHeight = this.loadedHeight;

    this.dataArray.forEach((array, index) => {
      let paintData = array;
      const canvas = this._canvas.dataTransfiguration(
        this.loadedWidth,
        this.loadedHeight,
        paintData
      );

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
      imageDiv.classList.add(`image-div`, `image-${this.characterIds[index]}`);
      imageDiv.style =
        "display: flex; align-items: center; justify-content: center; border: 1px solid black; width: 35px; height: 35px;";

      let duplicateData = this._canvas.exportData.findIndex(
        drawing =>
          drawing.width === canvas.width && drawing.height === canvas.height
      );

      if (duplicateData !== -1) {
        this._canvas.exportData[duplicateData].data.push({
          id: this.characterIds[index],
          data: array
        });
      } else if (duplicateData === -1) {
        this._canvas.exportData.push({
          ...{
            width: canvas.width,
            height: canvas.height,
            data: [
              {
                id: this.characterIds[index],
                data: array
              }
            ]
          }
        });
      }

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
        this._canvas.alphabetElement.appendChild(sizeDiv);

        dimensionsContainer.addEventListener("click", () => {
          this._canvas.alphabet.labelOnOff(
            dimensionsContainer,
            this._canvas.exportData
          );
        });
      }

      imageDiv.appendChild(image);
      imageDiv.addEventListener("click", () =>
        this._canvas.alphabet.select(imageDiv)
      );
    });
    // sort the created div elements based on height
    const sortedDivs = Array.from(
      this._canvas.alphabetElement.getElementsByClassName("size-div")
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
      this._canvas.alphabetElement.appendChild(sizeDiv);
    });
  }

  async loadCollectionsFromDb() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    const alphabetName = document.getElementById("alphabetName");
    this.collectionId = [];

    this.collections.forEach(item => {
      this.collectionId.push(item.Id);
      this.collectionNames.push(item.CollectionName);
    });

    const collectionContainer = document.getElementById(
      "load-db-collection-container"
    );
    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-db-modal-btn");
    const collections = document.querySelectorAll(`[class*="collection-id"]`);

    this.buildCollectionList();

    confirmBtn.addEventListener("click", async () => {
      this.loadDbCollectionModal.classList.add("hidden");
      alphabetName.innerHTML = `${this.collectionNames[this.currentSelection]}`;
      this.removeEventListeners(collections);
    });

    cancelBtn.addEventListener("click", async () => {
      const collectionList = document.getElementById("collection-list");
      collectionList.innerHTML = "";
      collectionContainer.classList.add("hidden");
      this.startModal.classList.remove("hidden");
      this.removeEventListeners(collections);
    });
  }

  buildCollectionList() {
    const collectionList = document.getElementById("collection-list");
    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");

    this.collections.forEach((item, index) => {
      const collectionDiv = document.createElement("div");
      collectionDiv.classList.add(
        `mb-2`,
        `collection-id-${this.collectionId[index]}`
      );

      const span = document.createElement("span");
      span.classList.add(
        `hover:bg-gray-100`,
        `hover:cursor-pointer`,
        `hover:text-header-hover`,
        `collection-name-${this.collectionId[index]}`
      );
      span.style.marginRight = "10px";

      const input = document.createElement("input");
      input.classList.add(`bg-transparent`, `input-default`);
      input.value = item.CollectionName;
      input.setAttribute("data-index", this.collectionId[index]);

      const edit = document.createElement("i");
      edit.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-edit`,
        `collection-edit-${this.collectionId[index]}`
      );
      edit.style.marginRight = "10px";

      const del = document.createElement("i");
      del.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-trash`,
        `collection-delete-${this.collectionId[index]}`
      );

      span.appendChild(input);
      collectionDiv.appendChild(span);
      collectionDiv.appendChild(edit);
      collectionDiv.appendChild(del);
      collectionList.appendChild(collectionDiv);

      const collectionHandler = () => {
        if (this.currentSelection !== -1 && this.currentSelection !== index) {
          const previousSelection = document.querySelector(
            `.collection-id-${this.collectionId[this.currentSelection]} input`
          );

          previousSelection.classList.remove("input-selected");
          previousSelection.classList.add("input-default");
        }

        if (!input.matches(":focus")) {
          if (input.classList.contains("input-default")) {
            input.classList.remove("input-default");
            input.classList.add("input-selected");
            confirmBtn.disabled = false;
          } else if (input.classList.contains("input-selected")) {
            input.classList.remove("input-selected");
            input.classList.add("input-default");
            confirmBtn.disabled = true;
          }
        }

        this.currentSelection = index;
      };

      const editIconHandler = e => {
        e.stopPropagation();

        if (this.currentSelection !== -1 && this.currentSelection !== index) {
          const previousSelection = document.querySelector(
            `.collection-id-${this.collectionId[this.currentSelection]} input`
          );

          previousSelection.classList.remove("input-selected");
          previousSelection.classList.add("input-default");
        }

        if (edit.classList.contains("fa-edit")) {
          edit.classList.remove("fa-edit");
          edit.classList.add("fa-save");

          input.focus();
          input.style =
            "color: #635456; text-decoration: underline; pointer-events: unset;";

          input.setSelectionRange(input.value.length, input.value.length);
        } else if (edit.classList.contains("fa-save")) {
          edit.classList.remove("fa-save");
          edit.classList.add("fa-edit");
          input.blur();
          input.style = "";

          this.updateName(this.collectionId[index], input.value);
        }
      };

      const delIconHandler = e => {
        e.stopPropagation();

        this.deleteCollection(this.collectionId[index]);
      };

      const enterKeyHandler = e => {
        if (e.key === "Enter") {
          edit.classList.remove("fa-save");
          edit.classList.add("fa-edit");
          input.blur();
          input.style = "";

          this.updateName(this.collectionId[index], input.value);
        }
      };

      const inputFocusOutHandler = e => {
        if (!input.contains(e.target)) {
          input.style = "";
          edit.classList.remove("fa-save");
          edit.classList.add("fa-edit");
        }
      };

      this.collectionHandler.push(collectionHandler);
      this.editIconHandler.push(editIconHandler);
      this.delIconHandler.push(delIconHandler);
      this.enterKeyHandler.push(enterKeyHandler);
      this.inputFocusOutHandler.push(inputFocusOutHandler);

      span.addEventListener("click", collectionHandler);
      edit.addEventListener("click", editIconHandler);
      del.addEventListener("click", delIconHandler);
      input.addEventListener("keydown", enterKeyHandler);
      document.addEventListener("click", inputFocusOutHandler);
    });
  }

  updateName(collectionId, newCollectionName) {
    const inputAlert = document.getElementById("load-db-input-alert");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    if (validFilenameRegex.test(newCollectionName)) {
      const duplicate = this.collections.find(
        item => newCollectionName === item.CollectionName
      );

      if (!duplicate) {
        fetch(`/update-collection-name/${collectionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ newCollectionName })
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error. Status: ${res.status}`);
            }

            return res.text();
          })
          .then(data => {
            inputAlert.classList.remove("hidden");
            inputAlert.style.color = "green";
            inputAlert.innerHTML = "The collection name has been updated.";
            setTimeout(() => {
              inputAlert.classList.add("hidden");
              inputAlert.style.color = "rgb(185, 28, 28)";
              inputAlert.innerHTML = "";
            }, 5000);
            console.log(`Collection name updated successfully: ${data}`);
          })
          .catch(err =>
            console.error(`Error updating collection name: ${err}`)
          );
      } else if (duplicate) {
        inputAlert.classList.remove("hidden");
        inputAlert.innerHTML =
          "There already exists a collection with the same name. Please choose a different name.";
        console.log("Duplicate filename. Please enter a different name.");
      }
    } else {
      inputAlert.classList.remove("hidden");
      inputAlert.innerHTML =
        "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
      console.log("Invalid filename. Please enter a valid filename.");
    }
  }

  deleteCollection(collectionId) {
    const delModal = document.getElementById("delete-collection-container");
    const confirmBtn = document.getElementById("delete-collection-confirm-btn");
    const cancelBtn = document.getElementById("delete-collection-cancel-btn");

    this.loadDbCollectionModal.classList.add("hidden");
    delModal.classList.remove("hidden");

    confirmBtn.addEventListener("click", () => {
      fetch(`/delete-collection/${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error. Status: ${res.status}`);
          }

          return res.text();
        })
        .then(data => {
          const collectionList = document.getElementById("collection-list");
          const inputAlert = document.getElementById("load-db-input-alert");

          delModal.classList.add("hidden");
          this.loadDbCollectionModal.classList.remove("hidden");
          collectionList.innerHTML = "";
          inputAlert.innerHTML = "";
          this.loadCollectionsFromDb();

          console.log(`Collection deleted successfully: ${data}`);
        })
        .catch(err => console.error(`Error deleting collection: ${err}`));
    });

    cancelBtn.addEventListener("click", () => {
      delModal.classList.add("hidden");
      this.loadDbCollectionModal.classList.remove("hidden");
    });
  }

  removeEventListeners(collections) {
    collections.forEach((item, index) => {
      const collection = item.querySelector("span");
      const input = collection.querySelector("span > input");
      const icons = item.querySelectorAll("i");

      collection.removeEventListener("click", this.collectionHandler[index]);
      icons[0].removeEventListener("click", this.editIconHandler[index]);
      icons[1].removeEventListener("click", this.delIconHandler[index]);
      input.removeEventListener("keydown", this.enterKeyHandler[index]);
      document.removeEventListener("click", this.inputFocusOutHandler[index]);
    });

    this.collectionHandler = [];
    this.editIconHandler = [];
    this.delIconHandler = [];
    this.enterKeyHandler = [];
    this.inputFocusOutHandler = [];

    this.currentSelection = -1;
  }
}
