const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

// This section will help you get a list of all the records.
recordRoutes.route("/menu/:collectionName").get(function (req, res) {
  let db_connect = dbo.getDb("suggestions");
  db_connect
    //  .collection("records")
    .collection(req.params.collectionName)
    //  "BiryaniAndRiceVegMenu"
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

recordRoutes.route("/updateItemPrice/:collectionName").put(async (req, res) => {
  try {
    const itemName = req.body.name;
    const newPrice = req.body.newPrice; // Assuming the new price is sent in the request body
    // console.log(itemName + "-->" + newPrice);
    // Find the document with the name 'Veg Spring Roll'
    const filter = { "listItems.name": itemName };
    const update = { $set: { "listItems.$.price": newPrice } };

    let db_connect = dbo.getDb();
    const result = await db_connect
      .collection(req.params.collectionName)
      .updateOne(filter, update);

    if (result.matchedCount > 0) {
      res
        .status(200)
        .json({ message: itemName + " price updated successfully!" });
    } else {
      res
        .status(404)
        .json({ message: itemName + " not found in the database." });
    }
  } catch (error) {
    console.error("Error updating price:", error);
    res.status(500).json({ message: "Error updating price." });
  }
});

recordRoutes.route("/getItemPrice/:collectionName").post(function (req, res) {
  const itemName = req.body.name;
  // console.log("Item name : ==>" + itemName);
  let db_connect = dbo.getDb("suggestions");
  db_connect
    .collection(req.params.collectionName)
    .findOne(
      { "listItems.name": itemName },
      { "listItems.$": 1 },
      function (err, result) {
        if (err) throw err;
        res.json(result.listItems[0].price);
      }
    );
});

recordRoutes.route("/getPassword").post(function (req, res) {
  let db_connect = dbo.getDb("suggestions");
  if (req.body.password === process.env.menuUpdatePassword) {
    db_connect
      //  .collection("records")
      .collection("MenuUpdatePassword")
      //  "BiryaniAndRiceVegMenu"
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
  } else res.status(401).send("Invalid credentials!");
});

recordRoutes.route("/updatePriceLog").post(async (req, res) => {
  let currentTime = new Date(Date.now());
  try {
    let document = {
      "Item Name": req.body.name,
      "Old Price": req.body.oldPrice,
      "New Price": req.body.newPrice,
      Category: req.body.collection,
      "Date&Time":
        currentTime.toLocaleDateString() +
        " " +
        currentTime.toLocaleTimeString(),
    };

    let db_connect = dbo.getDb();
    const result = await db_connect
      .collection("MenuUpdateLogs")
      .insertOne(document);
    // console.log(result);
    res.status(200).json(document);
  } catch (error) {
    console.error("Error updating logs:", error);
    res.status(500).json({ message: "Error updating logs, please try later." });
  }
});

recordRoutes.route("/ganesh23suggestions").get(function (req, res) {
  let db_connect = dbo.getDb("suggestions");
  db_connect
    //  .collection("records")
    .collection("Ganesh23Suggestions")
    //  "BiryaniAndRiceVegMenu"
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

recordRoutes.route("/ganesh23/addsuggestion").post(async (req, res) => {
  let currentTime = new Date();
  try {
    let document = {
      message: req.body.message,
      timestamp:
        currentTime.toLocaleDateString() +
        " " +
        currentTime.toLocaleTimeString(),
    };

    if (document.message === "") {
      console.log("Empty message... Could not update suggestion to database!");
      return;
    }

    let db_connect = dbo.getDb();
    const result = await db_connect
      .collection("Ganesh23Suggestions")
      .insertOne(document);
    // console.log(result);
    res.status(200).json(document);
  } catch (error) {
    console.error("Error updating logs:", error);
    res.status(500).json({ message: "Error updating logs, please try later." });
  }
});

module.exports = recordRoutes;
