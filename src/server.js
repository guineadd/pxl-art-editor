import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
// import http from "http";
import dotenv from "dotenv";
import pako from "pako";
import { db } from "./db.js";
import { sequelize } from "./db.js";
import { collectionModel } from "./models/collection.js";
import { characterModel } from "./models/character.js";

const app = express();
dotenv.config();

// increase the payload size limit for JSON and URL-encoded bodies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(express.static("public"));

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

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database and tables have been created.");
  })
  .catch(err => {
    console.error(`Error creating database: ${err}`);
  });

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(path.resolve(), "/favicon.ico"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(path.resolve(), "/public/index.html"));
});

app.get("/collections", async (req, res) => {
  try {
    const collections = await collectionModel(sequelize).findAll();
    res.status(200).json(collections);
  } catch (err) {
    console.error(`Error fetching collections: ${err}`);
    res.status(500).send("Error fetching collections.");
  }
});

app.post("/save-collection", async (req, res) => {
  try {
    const data = req.body;
    const collection = await collectionModel(sequelize).create({
      CollectionName: data.collectionName
    });

    console.log(
      `New collection created with name: ${collection.dataValues.CollectionName}`
    );
    res.status(200).send("Collection created successfully.");
  } catch (err) {
    console.error(`Error saving collection: ${err}`);
    res.status(500).send("Error creating collection.");
  }
});

app.put("/update-collection-name/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { newCollectionName } = req.body;

    const collection = await collectionModel(sequelize).findByPk(collectionId);

    if (!collection) {
      return res.status(404).send("Collection not found.");
    }

    collection.CollectionName = newCollectionName;
    await collection.save();

    console.log(`Collection name updated with: ${newCollectionName}`);
    res.status(200).send("Collection name updated successfully.");
  } catch (err) {
    console.error(`Error updating collection name: ${err}`);
    res.status(500).send("Error updating collection name.");
  }
});

app.post("/save-data", async (req, res) => {
  try {
    const dataToWrite = req.body;
    const CollectionName = dataToWrite.collectionTitle;
    const CharacterData = dataToWrite.hex[0];
    const CharacterHex = CharacterData.data[0];
    console.log(CharacterHex);

    // check if a collection with the same name already exists
    let existingCollection = await collectionModel(sequelize).findOne({
      where: { CollectionName }
    });

    await characterModel(sequelize).create({
      CollectionId: existingCollection.Id,
      CharacterData: JSON.stringify(CharacterHex),
      Width: CharacterData.width,
      Height: CharacterData.height
    });

    console.log(`New element added to: ${CollectionName}`);
    res.status(200).send("Data saved successfully.");
  } catch (err) {
    console.error(`Error adding data: ${err}`);
    res.status(500).send("Error adding data.");
  }
});

app.get("/get-data", async (req, res) => {
  const query = "SELECT draw, edit FROM data_table";

  db.all(query, (err, rows) => {
    if (err) {
      console.error(`Error reading data from the database: ${err}`);
      res.status(500).json({ error: "Error reading data from the database." });
    } else {
      res.json(rows);
    }
  });
});

app.post("/delete-data", async (req, res) => {
  const newData = {
    elements: [],
    hex: [],
    counter: 1
  };
  const newEditData = {
    data: []
  };
  const compressedEditData = pako.gzip(JSON.stringify(newEditData, null, 2));
  const deleteQuery = "DELETE FROM data_table";

  db.run(deleteQuery, deleteErr => {
    if (deleteErr) {
      console.error(`Error clearing table data: ${deleteErr}`);
      res.status(500).send("Error clearing table data.");
    } else {
      const insertQuery = "INSERT INTO data_table (draw, edit) VALUES (?, ?)";
      const values = [
        JSON.stringify(newData),
        JSON.stringify(compressedEditData)
      ];

      db.run(insertQuery, values, err => {
        if (err) {
          console.error(`Error saving data to the database: ${err}`);
          res.status(500).send("Error saving data to the database.");
        } else {
          res.send("Data saved successfully.");
        }
      });
    }
  });
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

// ! Uncomment the following for production testing

const server = https.createServer(credentials, app);

// const server = http.createServer(app);

server.listen(port, host, () => {
  // console.log("listening at http://%s:%s", host, port);
  console.log("listening at https://%s:%s", host, port);
});
