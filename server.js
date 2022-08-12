// https://zellwk.com/blog/crud-express-mongodb/

const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const PORT = 2121;
require("dotenv").config();

////////////// Example ///////////
// var url = MONGODB_STRING;

// MongoClient.connect(url, function (err, db) {
//   if (err) throw err;
//   var dbo = db.db("mydb");
//   console.log("(mydb)", " Database created!");
//   var myobj = { name: "Company Inc", address: "Highway 37" };
//   //dbo.createCollection("customers", function(err, res){}
//   dbo.collection("customers").insertOne(myobj, function (err, res) {
//     if (err) throw err;
//     console.log("(customers), Collection created!");
//     console.log("1 document inserted");
//     db.close();
//   });
// });

/////////////////////////

let db,
  dbConnectionStr = process.env.MONGODB_STRING,
  dbName = "todo";
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true }).then(
  (client) => {
    console.log(`Connected to:- ${dbName} Database`);
    db = client.db(dbName);
  }
);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (request, response) => {
  const todoItems = await db.collection("todos").find().toArray();
  const itemsLeft = await db
    .collection("todos")
    .countDocuments({ completed: false });
  response.render("index.ejs", { items: todoItems, left: itemsLeft });
  // db.collection('todos').find().toArray()
  // .then(data => {
  //     db.collection('todos').countDocuments({completed: false})
  //     .then(itemsLeft => {
  //         response.render('index.ejs', { items: data, left: itemsLeft })
  //     })
  // })
  // .catch(error => console.error(error))
});

app.post("/addTodo", (request, response) => {
  db.collection("todos")
    .insertOne({ thing: request.body.todoItem, completed: false })
    .then((result) => {
      console.log("Todo Added");
      response.redirect("/");
    })
    .catch((error) => console.error(error));
});

app.put("/markComplete", (request, response) => {
  db.collection("todos")
    .updateOne(
      { thing: request.body.itemFromJS },
      {
        $set: {
          completed: true,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      console.log("Marked Complete");
      response.json("Marked Complete");
    })
    .catch((error) => console.error(error));
});

app.put("/markUnComplete", (request, response) => {
  db.collection("todos")
    .updateOne(
      { thing: request.body.itemFromJS },
      {
        $set: {
          completed: false,
        },
      },
      {
        sort: { _id: -1 },
        upsert: false,
      }
    )
    .then((result) => {
      console.log("Un Mark Complete");
      response.json("Un Mark Complete");
    })
    .catch((error) => console.error(error));
});

app.delete("/deleteItem", (request, response) => {
  db.collection("todos")
    .deleteOne({ thing: request.body.itemFromJS })
    .then((result) => {
      console.log("Todo Deleted");
      response.json("Todo Deleted");
    })
    .catch((error) => console.error(error));
});

app.listen(PORT, () => {
  console.log("Server is up and running on port: ", PORT);
});
