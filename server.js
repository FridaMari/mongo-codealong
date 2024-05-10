import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/books";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

//Create models
const Author = mongoose.model("Author", {
  name: String,
});

const Book = mongoose.model("Book", {
  title: String,
  //Make the author an object, give it a type and define relationship (relate to an ObjectId from another model)
  author: {
    type: mongoose.Schema.Types.ObjectId,
    //define wich other model the objectId reffers to
    ref: "Author",
  },
});

//Wrap the seeding function inside an environment variable to prevent it from rerunning every time you restart the server
//Now, to run the seedData, type "RESET_DATABASE=true npm run dev" in the terminal
if (process.env.RESET_DATABASE) {
  console.log("Resetting database!");
  //Function to seed data:
  const seedDatabase = async () => {
    //Start with a blank slate:
    await Author.deleteMany();
    await Book.deleteMany();

    const tolkien = new Author({ name: "J.R.R. Tolkien" });
    await tolkien.save();

    const rowling = new Author({ name: "J.K. Rowling" });
    await rowling.save();

    await new Book({
      title: "Harry Potter and the Philosopher's Stone",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Chambers of Secrets",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Prisoner of Azkaban",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Goblet of Fire",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Order of the Phoenix",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Half-Blood Prince",
      author: rowling,
    }).save();
    await new Book({
      title: "Harry Potter and the Deathly Hollows",
      author: rowling,
    }).save();
    await new Book({ title: "The Lord of the Rings", author: tolkien }).save();
    await new Book({ title: "The Hobbit", author: tolkien }).save();

    console.log("Hello worldssss");
  };
  seedDatabase();
}

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());

// Add middleware that sits around every single request, that listens to wether the database is up or not. To check if this is working, stop the mongo database by opening a new terminal, type "brew services stop mongodb/brew/mongodb-community", and check if error response appears in postman. Then restart the database by typing the same, just change to "start" in the command
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    res.status(503).json({ error: "Service unavailable" });
  }
});

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

//restful endpoint for all authors
app.get("/authors", async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});

//endpoint for single author details
app.get("/authors/:id", async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    res.json(author);
  } else {
    res.status(404).json({ error: "Author not found" });
  }
});

//endpoint for books by author
app.get("/authors/:id/books", async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (author) {
    const books = await Book.find({
      author: mongoose.Types.ObjectId.createFromHexString(author.id),
    });
    res.json(books);
  } else {
    res.status(404).json({ error: "Author not found" });
  }
});

//restful endpoint for all books
app.get("/books", async (req, res) => {
  //get books in the same way as the authors, but also tell Mongo that we also want to include the relationship for author
  const books = await Book.find().populate("author");
  res.json(books);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
