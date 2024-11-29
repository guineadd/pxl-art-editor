import "@fortawesome/fontawesome-free/css/all.min.css";
import Canvas from "../components/canvas/canvas.js";
import canvasTemplate from "../components/canvas/canvas.html";
import Header from "../components/header/header.js";
import headerTemplate from "../components/header/header.html";
import Toolbox from "../components/toolbox/toolbox.js";
import toolboxTemplate from "../components/toolbox/toolbox.html";
import Alphabet from "../components/alphabet/alphabet.js";
import alphabetTemplate from "../components/alphabet/alphabet.html";
import CanvasDef from "../components/canvas-definition/canvas-definition.js";
import canvasDefTemplate from "../components/canvas-definition/canvas-definition.html";
import StartDialog from "../components/start-dialog/start-dialog.js";
import startDialogTemplate from "../components/start-dialog/start-dialog.html";

// insert html templates into containers
const canvasElement = document.getElementById("canvas-container");
canvasElement.innerHTML = canvasTemplate;

const headerElement = document.getElementById("header-container");
headerElement.innerHTML = headerTemplate;

const toolboxElement = document.getElementById("toolbox-container");
toolboxElement.innerHTML = toolboxTemplate;

const alphabetElement = document.getElementById("alphabet-container");
alphabetElement.innerHTML = alphabetTemplate;

const canvasDefElement = document.getElementById("canvas-def-container");
canvasDefElement.innerHTML = canvasDefTemplate;

const startDialogElement = document.getElementById("start-dialog-container");
startDialogElement.innerHTML = startDialogTemplate;

const canvas = new Canvas();
const header = new Header();
const toolbox = new Toolbox();
const alphabet = new Alphabet();
const startDialog = new StartDialog();
const canvasDef = new CanvasDef(toolbox);

canvas.setComponents(alphabet);
toolbox.setComponents(header, canvas);
header.setComponents(canvas, alphabet, startDialog);
canvasDef.setComponents(toolbox, canvas, header);
alphabet.setComponents(canvas);
startDialog.setComponents(canvas, alphabet);

// render the components after inserting the HTML templates
canvas.render(500, 500);
startDialog.render();
header.render();
toolbox.toolSelect();
toolbox.render();
alphabet.render();
canvasDef.render();
