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
    this.currentSelection = null;
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
    const collectionContainer = document.getElementById(
      "load-file-collection-container"
    );
    const collectionName = document.getElementById("load-file-collection-name");
    const confirmBtn = document.getElementById("confirm-load-file-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-file-modal-btn");
    const inputAlert = document.getElementById("load-file-input-alert");
    const fileInput = document.getElementById("start-modal-load-file");
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    collectionName.focus();
    inputAlert.classList.add("hidden");
    collectionName.value = "";

    collectionName.addEventListener("input", () => {
      confirmBtn.disabled = !collectionName.value;
    });

    confirmBtn.addEventListener("click", () => {
      if (validFilenameRegex.test(collectionName.value)) {
        fileInput.click();
      } else {
        inputAlert.innerHTML =
          "A file name can contain only letters, numbers, spaces, and ( ) _ - , . ";
        inputAlert.classList.remove("hidden");
        console.log("Invalid filename. Please enter a valid filename.");
      }
    });

    cancelBtn.addEventListener("click", async () => {
      collectionContainer.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  async loadCollectionsFromDb() {
    const response = await fetch("/collections");
    this.collections = await response.json();

    this.collectionId = [];

    this.collections.forEach(item => {
      this.collectionId.push(item.Id);
    });

    const collectionContainer = document.getElementById(
      "load-db-collection-container"
    );
    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-db-modal-btn");
    const collections = document.querySelectorAll(`[class*="collection-id"]`);
    const inputContainers = document.querySelectorAll(
      `[class*="collection-name"]`
    );

    this.buildCollectionList();

    inputContainers.forEach(item => {
      item.addEventListener("click", () => {
        collections.forEach(collection => {
          let input = collection.querySelector("span > input");
          if (input.classList.contains("input-selected")) {
            confirmBtn.disabled = !confirmBtn.disabled;
          }
        });
      });
    });

    confirmBtn.addEventListener("click", async () => {
      this.loadDbCollectionModal.classList.add("hidden");
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

    // inputContainers.forEach(item => {
    //   item.addEventListener("click", () => {
    //     console.log(`Hi.`);
    //     collections.forEach(collection => {
    //       let input = collection.querySelector("span > input");
    //       if (input.classList.contains("input-selected")) {
    //         confirmBtn.disabled = false;
    //       }
    //     });
    //   });
    // });
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
