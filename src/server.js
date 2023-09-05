import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
// import http from "http";
import dotenv from "dotenv";
import pako from "pako";
import { db } from "./db.js";
import { sequelize } from "./db.js";
import { fontModel } from "./models/font.js";
import { characterModel } from "./models/character.js";
import { hexDataModel } from "./models/hexData.js";
import { editDataModel } from "./models/editData.js";

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

app.post("/save-data", async (req, res) => {
  try {
    const dataToWrite = req.body;
    const compressedEditData = JSON.parse(dataToWrite.edit);
    const uncompressedEditData = JSON.parse(
      pako.ungzip(new Uint8Array(Object.values(compressedEditData)), {
        to: "string"
      })
    );

    let count = await characterModel(sequelize).count();

    const font = await fontModel(sequelize).create({
      FontName: dataToWrite.draw.collectionTitle
    });

    const character = await characterModel(sequelize).create({
      FontId: font.dataValues.Id,
      Html: dataToWrite.draw.elements[count]
    });

    const hexData = await hexDataModel(sequelize).create({
      CharacterId: character.dataValues.Id,
      Width: dataToWrite.draw.hex[0].width,
      Height: dataToWrite.draw.hex[0].height,
      DataString: JSON.stringify(dataToWrite.draw.hex[0].data[count])
    });

    const editData = await editDataModel(sequelize).create({
      CharacterId: character.dataValues.Id,
      EditString: JSON.stringify(uncompressedEditData.data[count])
    });

    console.log(`New element added with ID: ${character.dataValues.Id}`);
    console.log(`New hex data added with ID: ${hexData.dataValues.Id}`);
    console.log(`New edit data added with ID: ${editData.dataValues.Id}`);
    res.status(200).send("Data saved successfully.");
  } catch (err) {
    console.error(`Error adding data: ${err}`);
    res.status(500).send("Error adding data.");
  }
});

// app.post("/save-data", async (req, res) => {
//   const dataToWrite = req.body;
//   const deleteQuery = "DELETE FROM data_table";

//   db.run(deleteQuery, deleteErr => {
//     if (deleteErr) {
//       console.error(`Error clearing table data: ${deleteErr}`);
//       res.status(500).send("Error clearing table data.");
//     } else {
//       const insertQuery = "INSERT INTO data_table (draw, edit) VALUES (?, ?)";
//       const { draw, edit } = dataToWrite;
//       const drawJson = JSON.stringify(draw);
//       const values = [drawJson, edit];

//       db.run(insertQuery, values, err => {
//         if (err) {
//           console.error(`Error writing data to the database: ${err}`);
//           res.status(500).send("Error saving data.");
//         } else {
//           res.send("Data saved successfully.");
//         }
//       });
//     }
//   });
// });

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
