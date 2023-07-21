"use strict";
const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.use(express.static("public"));
app.use(express.json());
app.use("/assets/webfonts", express.static("../assets/webfonts"));
app.use(
  "/webfonts",
  express.static(
    path.join(
      __dirname,
      "node_modules",
      "@fortawesome/fontawesome-free/webfonts"
    )
  )
);

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "../favicon.ico"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/get-data", (req, res) => {
  const data = readFromDb();
  res.json(data);
});

app.post("/save-data", (req, res) => {
  const toWrite = req.body;
  writeToDb(toWrite);
  res.send("Data saved successfully.");
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

function writeToDb(data) {
  const filePath = path.join(__dirname, "db.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`Error writing data to file: ${err}`);
  }
}

function readFromDb() {
  const filePath = path.join(__dirname, "db.json");
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading data from file: ${err}`);
    return null;
  }
}

module.exports = {};
