export default class StartDialog {
  constructor() {
    this._canvas = null;
    this.newCollection = null;
    this.loadFromFile = null;
    this.loadFromDb = null;
    this.newCollectionModal = null;
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    const startModal = document.getElementById("start-modal-container");
    this.newCollectionModal = document.getElementById(
      "new-collection-container"
    );
    this.newCollection = document.getElementById("newCollection");
    this.loadFromFile = document.getElementById("loadFromFile");
    this.loadFromDb = document.getElementById("loadFromDb");

    this.newCollection.addEventListener("click", () => {
      startModal.classList.add("hidden");
      this.newCollectionModal.classList.remove("hidden");
      this.saveCollection();
    });

    this.loadFromFile.addEventListener("click", () => {
      console.log("loadFromfile");
    });

    this.loadFromDb.addEventListener("click", () => {
      console.log("loadFromDb");
    });
  }

  saveCollection() {
    const collectionName = document.getElementById("collection-name");
    const confirmSaveBtn = document.getElementById("confirm-save-modal-btn");
    const inputAlert = document.getElementById("input-alert");

    // regular expression for a valid filename (allowing alphanumeric characters, spaces , and ( ) _ - , .)
    // const validFilenameRegex = /^[a-zA-Z0-9-_]+$/;
    const validFilenameRegex = /^[a-zA-Z0-9\s()_\-,.]+$/;

    this.newCollectionModal.classList.remove("hidden");
    inputAlert.classList.add("hidden");
    collectionName.value = "";
    collectionName.addEventListener("input", () => {
      confirmSaveBtn.disabled = !collectionName.value;
    });
    confirmSaveBtn.addEventListener("click", async () => {
      if (validFilenameRegex.test(collectionName.value)) {
        console.log("Valid filename. Saving...");
        // add your code to save the collection here
      } else {
        inputAlert.classList.remove("hidden");
        console.log("Invalid filename. Please enter a valid filename.");
      }
    });
  }
}
