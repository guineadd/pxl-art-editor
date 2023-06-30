import "@fortawesome/fontawesome-free/css/all.min.css";
import "../styles/styles.css";
import Header from "../components/header/header";
import headerTemplate from "../components/header/header.html";
import Toolbox from "../components/toolbox/toolbox";
import toolboxTemplate from "../components/toolbox/toolbox.html";
import Canvas from "../components/canvas/canvas";
import canvasTemplate from "../components/canvas/canvas.html";
import Alphabet from "../components/alphabet/alphabet";
import alphabetTemplate from "../components/alphabet/alphabet.html";
import CanvasDef from "../components/canvas-definition/canvas-definition";
import canvasDefTemplate from "../components/canvas-definition/canvas-definition.html";

const header = new Header();
const toolbox = new Toolbox();
const canvas = new Canvas();
const alphabet = new Alphabet();
const canvasDef = new CanvasDef();

// insert html templates into containers
const headerElement = document.getElementById("header-container");
headerElement.innerHTML = headerTemplate;

const toolboxElement = document.getElementById("toolbox-container");
toolboxElement.innerHTML = toolboxTemplate;

const canvasElement = document.getElementById("canvas-container");
canvasElement.innerHTML = canvasTemplate;

const alphabetElement = document.getElementById("alphabet-container");
alphabetElement.innerHTML = alphabetTemplate;

const canvasDefElement = document.getElementById("canvas-def-container");
canvasDefElement.innerHTML = canvasDefTemplate;

// render the components after inserting the HTML templates
header.render();
toolbox.render();
canvas.render();
alphabet.render();
canvasDef.render();
