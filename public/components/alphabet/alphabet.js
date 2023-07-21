export default class Alphabet {
  constructor() {
    this.canvas = null;
    this._canvas = null;
    this.alphabet = null;
    this.selected = [];
  }

  setComponents(canvas) {
    this._canvas = canvas;
  }

  render() {
    this.alphabet = document.getElementById("alphabet");
  }

  select(div) {
    if (!div.classList.contains("selected")) {
      div.classList.add("selected");
      this.selected.push(div);
    } else if (div.classList.contains("selected")) {
      div.classList.remove("selected");
      let i = this.selected.indexOf(div);

      if (i > -1) {
        this.selected.splice(i, 1);
      }
    }

    this._canvas.updateButtonState();
  }

  labelOnOff(div) {
    if (div.parentElement.classList.contains("enabled")) {
      div.parentElement.classList.remove("enabled");
      div.parentElement.classList.add("disabled");

      div.parentElement.style = "order: 10; opacity: 0.5;";
      div.nextElementSibling.style = "pointer-events: none";
    } else if (div.parentElement.classList.contains("disabled")) {
      div.parentElement.classList.remove("disabled");
      div.parentElement.classList.add("enabled");

      div.parentElement.style = "order: unset; opacity: unset;";
      div.nextElementSibling.style = "pointer-events: unset";
    }
  }
}
