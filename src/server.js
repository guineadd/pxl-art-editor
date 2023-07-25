import express from "express";
import path from "path";
import fs from "fs/promises";

const app = express();

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
  try {
    const data = await fs.readFile(dataFilePath, "utf8");
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (err) {
    console.error(`Error reading data from file: ${err}`);
    res.status(500).json({ error: "Error reading data from file." });
  }
});

app.post("/save-data", async (req, res) => {
  const dataToWrite = req.body;
  const dataFilePath = path.join(path.resolve(), "/src/db.json");
  try {
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(dataToWrite, null, 2),
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
    const newData = {
      elements: [],
      hex: [],
      counter: 1
    };
    await fs.writeFile(dataFilePath, JSON.stringify(newData, null, 2), "utf8");
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
