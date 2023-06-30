export default class Toolbox {
  render() {
    // pencil is by default the selected tool -- use the selected class to work with different tools
    const defaultTool = document.querySelector(".default");

    defaultTool.style.color = "white";
    defaultTool.classList.add("selected");

    const tools = document.querySelectorAll(".tools > span");
    let selected = null;

    tools.forEach(tool => {
      tool.addEventListener("click", () => {
        defaultTool.style.color = "initial";
        defaultTool.classList.remove("selected");

        if (selected !== null) {
          selected.style.color = "initial";
          selected.classList.remove("selected");
        }

        selected = tool;
        tool.style.color = "white";
        tool.classList.add("selected");
      });
    });
  }
}
