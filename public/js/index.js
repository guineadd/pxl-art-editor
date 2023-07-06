import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/styles.css";
import Canvas from "../components/canvas/canvas";
import canvasTemplate from "../components/canvas/canvas.html";
import Header from "../components/header/header";
import headerTemplate from "../components/header/header.html";
import Toolbox from "../components/toolbox/toolbox";
import toolboxTemplate from "../components/toolbox/toolbox.html";
import Alphabet from "../components/alphabet/alphabet";
import alphabetTemplate from "../components/alphabet/alphabet.html";
import CanvasDef from "../components/canvas-definition/canvas-definition";
import canvasDefTemplate from "../components/canvas-definition/canvas-definition.html";

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

const canvas = new Canvas();
const header = new Header();
const toolbox = new Toolbox();
const alphabet = new Alphabet();
const canvasDef = new CanvasDef();

// render the components after inserting the HTML templates
canvas.init();
header.render();
toolbox.render();
alphabet.render();
canvasDef.render();
