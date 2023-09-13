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
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  async render() {
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

    const response = await fetch("/collections");
    this.collections = await response.json();
  }

  saveCollection() {
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

  loadCollectionsFromDb() {
    const collectionContainer = document.getElementById(
      "load-db-collection-container"
    );
    const confirmBtn = document.getElementById("confirm-load-db-modal-btn");
    const cancelBtn = document.getElementById("cancel-load-db-modal-btn");
    const collections = document.querySelectorAll(`[class*=collection-id]`);

    this.buildCollectionList();

    // collections.forEach(item => {
    //   const collection = item.querySelector("span");
    //   const input = collection.querySelector("span > input");
    //   const icons = item.querySelectorAll("i");

    //   const collectionId = this.collections.forEach(element => {
    //     if (input.value === element.CollectionName) {
    //       return element.CollectionId;
    //     }
    //   });

    //   const collectionHandler = () => {
    //     if (!input.matches(":focus")) {
    //       collections.forEach(other => {
    //         const restInputs = other.querySelector("span > input");

    //         if (restInputs !== input) {
    //           restInputs.classList.remove("input-selected");
    //           restInputs.classList.add("input-default");
    //         }
    //       });

    //       if (input.classList.contains("input-default")) {
    //         input.classList.remove("input-default");
    //         input.classList.add("input-selected");
    //       } else if (input.classList.contains("input-selected")) {
    //         input.classList.remove("input-selected");
    //         input.classList.add("input-default");
    //       }
    //     }
    //   };

    //   const editIconHandler = e => {
    //     e.stopPropagation();

    //     input.style =
    //       "color: #635456; text-decoration: underline; pointer-events: unset;";
    //     input.focus();

    //     input.setSelectionRange(input.value.length, input.value.length);
    //   };

    //   const delIconHandler = e => {
    //     e.stopPropagation();
    //   };

    //   const enterKeyHandler = e => {
    //     if (e.key === "Enter") {
    //       input.style = "";
    //       input.blur();

    //       this.updateName(collectionId, input.value);
    //     }
    //   };

    //   const documentClickHandler = e => {
    //     if (!item.contains(e.target)) {
    //       input.style = "";
    //       input.blur();

    //       this.updateName(collectionId, input.value);
    //     }
    //   };

    //   this.collectionHandler.push(collectionHandler);
    //   this.editIconHandler.push(editIconHandler);
    //   this.delIconHandler.push(delIconHandler);
    //   this.enterKeyHandler.push(enterKeyHandler);
    //   this.documentClickHandler.push(documentClickHandler);

    //   collection.addEventListener("click", collectionHandler);
    //   icons[0].addEventListener("click", editIconHandler);
    //   icons[1].addEventListener("click", delIconHandler);
    //   input.addEventListener("keydown", enterKeyHandler);
    //   document.addEventListener("click", documentClickHandler);
    // });

    confirmBtn.addEventListener("click", async () => {
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
    });

    cancelBtn.addEventListener("click", async () => {
      collectionContainer.classList.add("hidden");
      this.startModal.classList.remove("hidden");
    });
  }

  buildCollectionList() {
    const collectionList = document.getElementById("collection-list");

    this.collections.forEach((item, index) => {
      const collectionDiv = document.createElement("div");
      collectionDiv.classList.add(`mb-2`, `collection-id-${index + 1}`);

      const span = document.createElement("span");
      span.classList.add(
        `hover:bg-gray-100`,
        `hover:cursor-pointer`,
        `hover:text-header-hover`,
        `collection-name-${index + 1}`
      );
      span.style.marginRight = "10px";

      const input = document.createElement("input");
      input.classList.add(`bg-transparent`, `input-default`);
      input.value = item.CollectionName;
      input.setAttribute("data-index", index + 1);

      const edit = document.createElement("i");
      edit.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-edit`,
        `collection-edit-${index + 1}`
      );
      edit.style.marginRight = "10px";

      const del = document.createElement("i");
      del.classList.add(
        `hover:text-header-hover`,
        `hover:cursor-pointer`,
        `fa`,
        `fa-trash`,
        `collection-delete-${index + 1}`
      );

      span.appendChild(input);
      collectionDiv.appendChild(span);
      collectionDiv.appendChild(edit);
      collectionDiv.appendChild(del);
      collectionList.appendChild(collectionDiv);

      const collectionHandler = () => {
        if (!input.matches(":focus")) {
          if (input.classList.contains("input-default")) {
            input.classList.remove("input-default");
            input.classList.add("input-selected");
          } else if (input.classList.contains("input-selected")) {
            input.classList.remove("input-selected");
            input.classList.add("input-default");
          }
        }
      };

      const editIconHandler = e => {
        e.stopPropagation();

        if (edit.classList.contains("fa-edit")) {
          edit.classList.remove("fa-edit");
          edit.classList.add("fa-save");

          input.style =
            "color: #635456; text-decoration: underline; pointer-events: unset;";
          input.focus();

          input.setSelectionRange(input.value.length, input.value.length);
        } else if (edit.classList.contains("fa-save")) {
          edit.classList.remove("fa-save");
          edit.classList.add("fa-edit");
          input.blur();

          this.updateName(index + 1, input.value);
        }
      };

      const delIconHandler = e => {
        e.stopPropagation();
      };

      const enterKeyHandler = e => {
        if (e.key === "Enter") {
          input.style = "";
          input.blur();
          edit.classList.remove("fa-save");
          edit.classList.add("fa-edit");

          this.updateName(index + 1, input.value);
        }
      };

      const inputFocusOutHandler = () => {
        input.style = "";
        edit.classList.remove("fa-save");
        edit.classList.add("fa-edit");
      };

      this.collectionHandler.push(collectionHandler);
      this.editIconHandler.push(editIconHandler);
      this.delIconHandler.push(delIconHandler);
      this.enterKeyHandler.push(enterKeyHandler);
      this.inputFocusOutHandler.push(inputFocusOutHandler);

      collectionDiv.addEventListener("click", collectionHandler);
      edit.addEventListener("click", editIconHandler);
      del.addEventListener("click", delIconHandler);
      input.addEventListener("keydown", enterKeyHandler);
      input.addEventListener("blur", inputFocusOutHandler);
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
}
