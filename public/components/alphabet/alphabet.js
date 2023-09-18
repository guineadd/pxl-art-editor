export default class Alphabet {
  constructor() {
    this._canvas = null;
    this.alphabet = null;
    this.selected = [];
    this.disabled = [];
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    this.alphabet = document.getElementById("alphabet");
  }

  select(div) {
    const selected = div.classList.contains("selected");

    this.selected.forEach(div => {
      div.classList.remove("selected");
    });

    this.selected = [];

    if (selected) {
      div.classList.remove("selected");
    } else if (!selected) {
      div.classList.add("selected");
      this.selected.push(div);
    }

    this._canvas.updateButtonState(this.selected);
  }

  labelOnOff(div, data) {
    let dimensions = div.parentElement.classList[1].split("_")[1].split("x");
    let width = parseInt(dimensions[0], 10);
    let height = parseInt(dimensions[1], 10);

    if (div.parentElement.classList.contains("enabled")) {
      div.parentElement.classList.remove("enabled");
      div.parentElement.classList.add("disabled");

      div.parentElement.style = "order: 10; opacity: 0.5;";
      div.nextElementSibling.style =
        "pointer-events: none; display: flex; flex-direction: row; flex-wrap: wrap;";
      data = data.filter(obj => {
        if (obj.width === width && obj.height === height) {
          this.disabled.push(obj);
          return false;
        }

        return true;
      });
    } else if (div.parentElement.classList.contains("disabled")) {
      div.parentElement.classList.remove("disabled");
      div.parentElement.classList.add("enabled");

      div.parentElement.style = "order: unset; opacity: unset;";
      div.nextElementSibling.style =
        "pointer-events: unset; display: flex; flex-direction: row; flex-wrap: wrap;";
      this.disabled.forEach((obj, idx) => {
        if (obj.width === width && obj.height === height) {
          data.push(obj);
          this.disabled.splice(idx, 1);
        }
      });

      data.forEach((obj, idx) => {
        if (data.indexOf(obj) !== idx) {
          data.splice(idx, 1);
        }
      });
    }

    this._canvas.exportData = data;
  }
}
