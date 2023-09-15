import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
// import http from "http";
import dotenv from "dotenv";
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

app.delete("/delete-collection/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;

    const collection = await collectionModel(sequelize).findByPk(collectionId);

    if (!collection) {
      return res.status(404).send("Collection not found.");
    }

    await collection.destroy();

    console.log(`Collection with ID ${collectionId} has been deleted.`);
    res.status(200).send("Collection deleted successfully");
  } catch (err) {
    console.error(`Error deleting collection: ${err}`);
    res.status(500).send("Error deleting collection.");
  }
});

app.post("/save-data", async (req, res) => {
  try {
    const dataToWrite = req.body;
    const CollectionName = dataToWrite.collectionTitle;
    const CharacterHex = dataToWrite.hex.data;

    // check if a collection with the same name already exists
    let existingCollection = await collectionModel(sequelize).findOne({
      where: { CollectionName }
    });

    const character = await characterModel(sequelize).create({
      CollectionId: existingCollection.Id,
      CharacterData: JSON.stringify(CharacterHex),
      Width: dataToWrite.width,
      Height: dataToWrite.height
    });

    console.log(`New element added to: ${CollectionName}`);
    res.status(200).json(character.dataValues.Id);
  } catch (err) {
    console.error(`Error adding data: ${err}`);
    res.status(500).send("Error adding data.");
  }
});

app.post("/save-multiple-data", async (req, res) => {
  try {
    const dataToWrite = req.body;
    const CollectionName = dataToWrite.collectionTitle;
    const CharacterHex = dataToWrite.hex;

    const collection = await collectionModel(sequelize).create({
      CollectionName: CollectionName
    });

    const characterPromises = [];
    const characterIds = []; // array to store character IDs

    CharacterHex.forEach(array => {
      const characterPromise = characterModel(sequelize).create({
        CollectionId: collection.Id,
        CharacterData: JSON.stringify(array),
        Width: dataToWrite.width,
        Height: dataToWrite.height
      });

      characterPromise.then(character => {
        characterIds.push(character.Id); // push the ID of the created character
      });

      characterPromises.push(characterPromise);
    });

    // wait for all character creations to complete
    await Promise.all(characterPromises);

    console.log(`New element added to: ${CollectionName}`);
    res.status(200).json({ message: "Data saved successfully", characterIds });
  } catch (err) {
    console.error(`Error adding data: ${err}`);
    res.status(500).send("Error adding data.");
  }
});

app.get("/edit-character/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;

    const character = await characterModel(sequelize).findByPk(characterId);

    if (!character) {
      return res.status(404).send("Character not found.");
    }

    const characterData = JSON.parse(character.CharacterData);
    res.status(200).json(characterData);
  } catch (err) {
    console.error(`Error fetching character data: ${err}`);
    res.status(500).send("Error fetching character data.");
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

// ! Uncomment the following for production testing

const server = https.createServer(credentials, app);

// const server = http.createServer(app);

server.listen(port, host, () => {
  // console.log("listening at http://%s:%s", host, port);
  console.log("listening at https://%s:%s", host, port);
});
