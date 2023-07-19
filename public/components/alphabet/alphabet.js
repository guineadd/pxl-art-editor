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

  render() {}

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
}
