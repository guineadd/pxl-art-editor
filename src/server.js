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
  const dataFilePath = path.join(__dirname, "db.json");
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (err) {
    console.error(`Error reading data from file: ${err}`);
    res.status(500).json({ error: "Error reading data from file." });
  }
});

app.post("/save-data", (req, res) => {
  const dataToWrite = req.body;
  const dataFilePath = path.join(__dirname, "db.json");
  try {
    fs.writeFileSync(
      dataFilePath,
      JSON.stringify(dataToWrite, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error(`Error writing data to file: ${err}`);
  }

  res.send("Data saved successfully.");
});

app.post("/delete-data", (req, res) => {
  try {
    const dataFilePath = path.join(__dirname, "db.json");
    const newData = {
      elements: [],
      hex: [],
      counter: 1
    };
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2), "utf8");
    res.send("Data deleted successfully.");
  } catch (err) {
    console.error(`Error deleting data: ${err}`);
    res.status(500).send("Error deleting data.");
  }
});

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = {};
