import express from "express";
import path from "path";
import https from "https";
import fsPromises from "fs/promises";
import fs from "fs";
import dotenv from "dotenv";
import pako from "pako";
// import { Readable } from "stream";

const app = express();
dotenv.config();

// increase the payload size limit for JSON and URL-encoded bodies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(express.static("public"));
app.use(express.json());

app.use("/assets/webfonts", express.static("../assets/webfonts"));
app.use(
  "/webfonts",
  express.static(
    path.join(
      path.resolve(),
      "node_modules",
      "@fortawesome/fontawesome-free/webfonts"
    )
  )
);

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(path.resolve(), "/favicon.ico"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "/public/index.html"));
});

app.get("/get-data", async (req, res) => {
  const dataFilePath = path.join(path.resolve(), "/src/db.json");
  const editDataFilePath = path.join(path.resolve(), "/src/edit.json");
  try {
    const data = await fsPromises.readFile(dataFilePath, "utf8");
    const jsonData = JSON.parse(data);
    const editData = await fsPromises.readFile(editDataFilePath, "utf8");
    const jsonEditData = editData;

    const mergedData = {
      elements: jsonData.elements || [],
      hex: jsonData.hex || [],
      counter: jsonData.counter || 1,
      data: jsonEditData
    };
    res.json(mergedData);
  } catch (err) {
    console.error(`Error reading data from file: ${err}`);
    res.status(500).json({ error: "Error reading data from file." });
  }
});

app.post("/save-data", async (req, res) => {
  const dataToWrite = req.body;
  const dataFilePath = path.join(path.resolve(), "/src/db.json");
  const editDataFilePath = path.join(path.resolve(), "/src/edit.json");

  // try {
  //   const chunk = parseInt(req.query.edit.chunk);
  // }

  try {
    await fsPromises.writeFile(
      dataFilePath,
      JSON.stringify(dataToWrite.draw, null, 2),
      "utf8"
    );

    await fsPromises.writeFile(
      editDataFilePath,
      JSON.stringify(dataToWrite.edit, null, 2),
      "utf8"
    );
  } catch (err) {
    console.error(`Error writing data to file: ${err}`);
  }

  res.send("Data saved successfully.");
});

app.post("/delete-data", async (req, res) => {
  try {
    const dataFilePath = path.join(path.resolve(), "/src/db.json");
    const editDataFilePath = path.join(path.resolve(), "/src/edit.json");
    const newData = {
      elements: [],
      hex: [],
      counter: 1
    };
    const newEditData = {
      data: []
    };
    const compressedEditData = pako.gzip(JSON.stringify(newEditData, null, 2));

    await fsPromises.writeFile(
      dataFilePath,
      JSON.stringify(newData, null, 2),
      "utf8"
    );
    await fsPromises.writeFile(
      editDataFilePath,
      JSON.stringify(JSON.stringify(compressedEditData), null, 2),
      "utf8"
    );
    res.send("Data deleted successfully.");
  } catch (err) {
    console.error(`Error deleting data: ${err}`);
    res.status(500).send("Error deleting data.");
  }
});

const port = process.env.port;
const host = process.env.host;

const key = fs.readFileSync("private_key.key", "utf8");
const cert = fs.readFileSync("client_pxlart.crt", "utf8");
const credentials = { key: key, cert: cert };

// !Uncomment the following for development testing

// app.listen(port, () => {
//   console.log(`Server is running at http://localhost:${port}`);
// });

// ! Uncomment the following for production testing on host's IP

const server = https.createServer(credentials, app);

server.listen(port, host, () => {
  console.log("listening at https://%s:%s", host, port);
});
