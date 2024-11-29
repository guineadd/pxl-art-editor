export default class StartDialog {
  constructor() {
    this._canvas = null;
    this.alphabet = null;
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
    this.DbWidth = null;
    this.DbHeight = null;
    this.fileContent = this.fileContent.bind(this);
    this.saveConfirmFlag = false;
    this.loadDbConfirmFlag = false;
    this.loadFileConfirmFlag = false;
  }

  setComponents(canvas, alphabet) {
    this._canvas = canvas;
    this.alphabet = alphabet;
  }

  render() {
    this.startModal = document.getElementById("start-modal-container");
    this.newCollectionModal = document.getElementById("new-collection-container");
    this.loadFileCollectionModal = document.getElementById("load-file-collection-container");
    this.loadDbCollectionModal = document.getElementById("load-db-collection-container");
    this.newCollection = document.getElementById("newCollection");
    this.loadFromFile = document.getElementById("loadFromFile");
    this.loadFromDb = document.getElementById("loadFromDb");

    this.newCollection.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.newCollectionModal.classList.remove("hidden");

      document.removeEventListener("keyup", e => this.closeModalEsc(e, this.newCollectionModal, this.startModal));

      document.addEventListener("keyup", e => this.closeModalEsc(e, this.newCollectionModal, this.startModal));

      this.saveCollection();
    });

    this.loadFromFile.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.loadFileCollectionModal.classList.remove("hidden");

      document.removeEventListener("keyup", e => this.closeModalEsc(e, this.loadFileCollectionModal, this.startModal));

      this.loadCollection();
    });

    this.loadFromDb.addEventListener("click", () => {
      this.startModal.classList.add("hidden");
      this.loadDbCollectionModal.classList.remove("hidden");

      document.removeEventListener("keyup", e => this.closeModalEsc(e, this.loadDbCollectionModal, this.startModal));

      this.loadCollectionsFromDb();
    });

    this.currentSelection = -1;
  }

  closeModalEsc(e, currContainer, prevContainer) {
    if (e.key === "Escape") {
      currContainer.classList.add("hidden");
      prevContainer.classList.remove("hidden");
    }
  }

  async saveCollection() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    const collectionName = document.getElementById("collection-name");
    const input = document.getElementById("collection-name");
    const confirmSaveBtn = document.getElementById("confirm-save-modal-btn");
    const cancelSaveBtn = document.getElementById("cancel-save-modal-btn");
    const inputAlert = document.getElementById("new-input-alert");
    const alphabetName = document.getElementById("alphabetName");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    document.addEventListener("keyup", e => this.closeModalEsc(e, this.newCollectionModal, this.startModal));

    collectionName.focus();
    inputAlert.classList.add("hidden");
    collectionName.value = "";

    collectionName.addEventListener("input", () => {
      confirmSaveBtn.disabled = !collectionName.value;
    });

    const checkDuplicateFile = async () => {
      if (validFilenameRegex.test(collectionName.value)) {
        const duplicate = this.collections.find(item => collectionName.value === item.CollectionName);

        if (!duplicate) {
          fetch("/save-collection", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ collectionName: collectionName.value }),
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
            })
            .catch(err => console.error(`Error creating collection: ${err}`));

          alphabetName.innerHTML = collectionName.value;
          this.newCollectionModal.classList.add("hidden");
          this._canvas.exportData = [];
        } else if (duplicate) {
          inputAlert.classList.remove("hidden");
          inputAlert.innerHTML =
            "There already exists a collection with the same name. Please choose a different name.";
          collectionName.focus();
        }
      } else {
        inputAlert.innerHTML = "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
        inputAlert.classList.remove("hidden");
        console.log("Invalid filename. Please enter a valid filename.");
      }
    };

    if (!this.saveConfirmFlag) {
      this.saveConfirmFlag = true;
      confirmSaveBtn.addEventListener("click", checkDuplicateFile);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          confirmSaveBtn.click();
        }
      });
    }

    cancelSaveBtn.addEventListener("click", async () => {
      this.newCollectionModal.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  async loadCollection() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    const collectionName = document.getElementById("load-file-collection-name");
    const confirmBtn = document.getElementById("confirm-load-file-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-file-modal-btn");
    const inputAlert = document.getElementById("load-file-input-alert");
    const input = document.getElementById("load-file-collection-name");
    this.fileInput = document.getElementById("start-modal-load-file");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    document.addEventListener("keyup", e => this.closeModalEsc(e, this.loadFileCollectionModal, this.startModal));

    const fileDialog = () => {
      if (validFilenameRegex.test(collectionName.value)) {
        const duplicate = this.collections.find(item => collectionName.value === item.CollectionName);
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
        inputAlert.innerHTML = "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
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

    if (!this.loadFileConfirmFlag) {
      this.loadFileConfirmFlag = true;
      confirmBtn.addEventListener("click", fileDialog);
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          confirmBtn.click();
        }
      });
    }

    cancelBtn.addEventListener("click", async () => {
      confirmBtn.removeEventListener("click", fileDialog);
      this.loadFileCollectionModal.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  fileContent() {
    if (this.fileInput.files.length > 0) {
      const alphabetName = document.getElementById("alphabetName");

      const file = this.fileInput.files[0];
      const reader = new FileReader();

      reader.onload = event => {
        const fileContent = event.target.result;

        this.file = fileContent;
        this.loadFileCollectionModal.classList.add("hidden");
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

    const sizeRegex = /\/\/ Bitmap[^)]*\b(\d+x\d+)\b[^)]*\)/g;
    const charRegex = /const uint8_t\s+.*?\{([^}]+)\};/gs;

    const sizes = {};
    let sizeMatch;

    let lastCharIndex = 0;

    while ((sizeMatch = sizeRegex.exec(this.file)) !== null) {
      const dimensions = sizeMatch[1];
      const [width, height] = dimensions.split("x").map(Number);
      const sizeKey = `${width}x${height}`;

      if (!sizes[sizeKey]) {
        sizes[sizeKey] = { width, height, data: [] };
      }

      const charDataMatch = this.file.slice(lastCharIndex).match(charRegex);

      if (charDataMatch) {
        const charBlock = charDataMatch[0];
        lastCharIndex += this.file.slice(lastCharIndex).indexOf(charBlock) + charBlock.length;
        const hexRegex = /0[xX][0-9A-Fa-f]{2}/g;
        const hexValues = charBlock.match(hexRegex);

        if (hexValues) {
          const values = hexValues.map(hex => parseInt(hex, 16));
          sizes[sizeKey].data.push(values);
        }
      }
    }

    this.dataArray = Object.values(sizes);
  }

  async saveHexToDb() {
    const saveBody = {
      data: this.dataArray.map(sizeGroup => ({
        hex: sizeGroup.data,
        width: sizeGroup.width,
        height: sizeGroup.height,
      })),
      collectionTitle: this.collectionNameLoad,
    };
    try {
      const res = await fetch("/save-multiple-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saveBody),
      });

      if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);

      const data = await res.json();
      this.characterIds = data.characterIds;

      for (const sizeGroup of this.dataArray) {
        this.paintMultipleFromDb(sizeGroup.width, sizeGroup.height, sizeGroup.data);
      }
    } catch (err) {
      console.error(`Error saving data: ${err}`);
    }
  }

  paintMultipleFromDb(currentWidth, currentHeight, CharacterData) {
    this._canvas.exportData = [];

    this._canvas.canvas.setDimensions({
      width: currentWidth * this._canvas.gridSize,
      height: currentHeight * this._canvas.gridSize,
    });
    this._canvas.grid.setDimensions({
      width: currentWidth * this._canvas.gridSize,
      height: currentHeight * this._canvas.gridSize,
    });
    this._canvas.canvasWidth.value = currentWidth;
    this._canvas.canvasHeight.value = currentHeight;
    this._canvas.createdWidth = currentWidth;
    this._canvas.createdHeight = currentHeight;

    CharacterData.forEach((array, index) => {
      let paintData = array;
      const canvas = this._canvas.dataTransfiguration(currentWidth, currentHeight, paintData);

      const scaledCanvas = document.createElement("canvas");
      scaledCanvas.width = canvas.width * 25;
      scaledCanvas.height = canvas.height * 25;
      const scaledContext = scaledCanvas.getContext("2d");
      scaledContext.imageSmoothingEnabled = false;
      scaledContext.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

      const dataURL = scaledCanvas.toDataURL();
      const image = new Image();
      image.src = dataURL;
      image.width = 25;
      image.height = 25;

      const dimensionsDiv = document.querySelector(`.size_${canvas.width}x${canvas.height}`);

      const imageDiv = document.createElement("div");
      imageDiv.classList.add(`image-div`, `image-${this.characterIds[index]}`);
      imageDiv.style =
        "display: flex; align-items: center; justify-content: center; border: 1px solid black; width: 35px; height: 35px;";

      let duplicateData = this._canvas.exportData.findIndex(
        drawing => drawing.width === canvas.width && drawing.height === canvas.height,
      );

      if (duplicateData !== -1) {
        this._canvas.exportData[duplicateData].data.push({
          id: this.characterIds[index],
          data: array,
        });
      } else if (duplicateData === -1) {
        this._canvas.exportData.push({
          ...{
            width: canvas.width,
            height: canvas.height,
            data: [
              {
                id: this.characterIds[index],
                data: array,
              },
            ],
          },
        });
      }

      if (dimensionsDiv) {
        dimensionsDiv.querySelector(`.image-container_${canvas.width}x${canvas.height}`).appendChild(imageDiv);
      } else {
        const sizeDiv = document.createElement("div");
        sizeDiv.classList.add(`size-div`, `size_${canvas.width}x${canvas.height}`, `enabled`);
        sizeDiv.style = "order: unset; opacity: unset; display: flex; flex-direction: column; align-items: start;";

        const dimensionsContainer = document.createElement("div");
        dimensionsContainer.classList.add(`dimensions-container`);
        dimensionsContainer.style = "display: flex; margin: 5px 0;";

        const h5 = document.createElement("h5");
        h5.innerHTML = `Size ${canvas.width} x ${canvas.height}`;

        const imageContainer = document.createElement("div");
        imageContainer.classList.add(`image-container_${canvas.width}x${canvas.height}`);
        imageContainer.style = "pointer-events: unset; display: flex; flex-direction: row; flex-wrap: wrap;";

        dimensionsContainer.appendChild(h5);
        sizeDiv.appendChild(dimensionsContainer);
        sizeDiv.appendChild(imageContainer);
        imageContainer.appendChild(imageDiv);
        this._canvas.alphabetElement.appendChild(sizeDiv);

        dimensionsContainer.addEventListener("click", () => {
          this._canvas.alphabet.labelOnOff(dimensionsContainer, this._canvas.exportData);
        });
      }

      imageDiv.appendChild(image);
      imageDiv.addEventListener("click", () => this._canvas.alphabet.select(imageDiv));
    });
    // sort the created div elements based on height
    const sortedDivs = Array.from(this._canvas.alphabetElement.getElementsByClassName("size-div")).sort((a, b) => {
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
    this._canvas.updateButtonState(this.alphabet.selected);
  }

  async loadCollectionsFromDb() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    const collectionList = document.getElementById("collection-list");
    collectionList.innerHTML = "";

    const alphabetName = document.getElementById("alphabetName");
    this.collectionId = [];
    this.collectionNames = [];

    this.collections.forEach(item => {
      this.collectionId.push(item.Id);
      this.collectionNames.push(item.CollectionName);
    });

    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-db-modal-btn");
    const collections = document.querySelectorAll(`[class*="collection-id"]`);

    document.addEventListener("keyup", e => this.closeModalEsc(e, this.loadDbCollectionModal, this.startModal));

    this.buildCollectionList();

    const loadFromDbConfirmHandler = () => {
      this.loadDataFromDb();
      this.loadDbCollectionModal.classList.add("hidden");
      alphabetName.innerHTML = `${this.collectionNames[this.currentSelection]}`;
      this.removeEventListeners(collections);
    };

    cancelBtn.addEventListener("click", async () => {
      const collectionList = document.getElementById("collection-list");
      collectionList.innerHTML = "";
      this.loadDbCollectionModal.classList.add("hidden");
      this.startModal.classList.remove("hidden");
      this.removeEventListeners(collections);
    });

    if (!this.loadDbConfirmFlag) {
      this.loadDbConfirmFlag = true;
      confirmBtn.addEventListener("click", loadFromDbConfirmHandler);
    }
  }

  async loadDataFromDb() {
    const selectedCollection = document.querySelector(".input-selected");
    const alphabetName = document.getElementById("alphabetName");
    let loadBody = {
      collectionTitle: selectedCollection.value,
    };

    await fetch(`/load-multiple-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loadBody),
    })
      .then(res => {
        if (res.status === 404) return { status: 404 };
        if (!res.ok) throw new Error(`HTTP error. Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        alphabetName.innerHTML = selectedCollection.value;
        if (data?.status === 404) return;

        const characterDataArray = data.map(character => JSON.parse(character.CharacterData));
        const dimensionBuckets = {};
        this.characterIds = data.map(character => character.Id);

        data.forEach((character, index) => {
          const width = character.Width;
          const height = character.Height;
          const key = `${width}x${height}`;

          if (!dimensionBuckets[key]) {
            dimensionBuckets[key] = {
              width,
              height,
              characters: [],
            };
          }

          dimensionBuckets[key].characters.push(characterDataArray[index]);
        });

        Object.values(dimensionBuckets).forEach(({ width, height, characters }) => {
          this.paintMultipleFromDb(width, height, characters);
        });
      })
      .catch(err => console.error(`Error saving data: ${err}`));
  }

  buildCollectionList() {
    const collectionList = document.getElementById("collection-list");
    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");

    this.collections.forEach((item, index) => {
      const collectionDiv = document.createElement("div");
      collectionDiv.classList.add(`mb-2`, `collection-id-${this.collectionId[index]}`, `flex`, `flex-row`);

      const span = document.createElement("div");
      span.classList.add(
        `hover:bg-gray-100`,
        `hover:cursor-pointer`,
        `hover:text-header-hover`,
        `mr-2`,
        `collection-name-${this.collectionId[index]}`,
      );
      span.style.width = "240px";

      const input = document.createElement("input");
      input.classList.add(`bg-transparent`, `input-default`);
      input.value = item.CollectionName;
      input.setAttribute("data-index", this.collectionId[index]);
      input.setAttribute("maxLength", "16");

      const actionContainer = document.createElement("div");
      actionContainer.classList.add(`flex`, `flex-row`, `items-center`);

      const edit = document.createElement("i");
      edit.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-edit`,
        `mr-2`,
        `collection-edit-${this.collectionId[index]}`,
      );

      const del = document.createElement("i");
      del.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-trash`,
        `collection-delete-${this.collectionId[index]}`,
      );

      span.appendChild(input);
      collectionDiv.appendChild(span);
      collectionDiv.appendChild(actionContainer);
      actionContainer.appendChild(edit);
      actionContainer.appendChild(del);
      collectionList.appendChild(collectionDiv);

      const collectionHandler = () => {
        if (this.currentSelection !== -1 && this.currentSelection !== index) {
          const previousSelection = document.querySelector(
            `.collection-id-${this.collectionId[this.currentSelection]} input`,
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
            `.collection-id-${this.collectionId[this.currentSelection]} input`,
          );

          previousSelection.classList.remove("input-selected");
          previousSelection.classList.add("input-default");
        }

        if (edit.classList.contains("fa-edit")) {
          edit.classList.remove("fa-edit");
          edit.classList.add("fa-save");

          input.focus();
          input.style = "color: #635456; text-decoration: underline; pointer-events: unset;";

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
      const duplicate = this.collections.find(item => newCollectionName === item.CollectionName);

      if (!duplicate) {
        fetch(`/update-collection-name/${collectionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ newCollectionName }),
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
          .catch(err => console.error(`Error updating collection name: ${err}`));
      } else if (duplicate) {
        inputAlert.classList.remove("hidden");
        inputAlert.innerHTML = "There already exists a collection with the same name. Please choose a different name.";
        console.log("Duplicate filename. Please enter a different name.");
      }
    } else {
      inputAlert.classList.remove("hidden");
      inputAlert.innerHTML = "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
      console.log("Invalid filename. Please enter a valid filename.");
    }
  }

  deleteCollection(collectionId) {
    const delModal = document.getElementById("delete-collection-container");
    const confirmBtn = document.getElementById("delete-collection-confirm-btn");
    const cancelBtn = document.getElementById("delete-collection-cancel-btn");

    this.loadDbCollectionModal.classList.add("hidden");
    delModal.classList.remove("hidden");

    const delCollectionHandler = () => {
      fetch(`/delete-collection/${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
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

          confirmBtn.removeEventListener("click", delCollectionHandler);

          console.log(`Collection deleted successfully: ${data}`);
        })
        .catch(err => console.error(`Error deleting collection: ${err}`));
    };

    confirmBtn.addEventListener("click", delCollectionHandler);

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
