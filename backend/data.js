require("dotenv").config();
const mongoose = require("mongoose");
const Author = require("./models/author");
const Book = require("./models/book");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    genres: ["classic", "revolution"],
  },
];

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

///insert authors
/*
authors.map(async (author) => {
  delete author.id;
  const authObj = new Author(author);
  const saved = await authObj.save();
  console.log(saved);
});
*/

/*
//insert books
books.map(async (book) => {
  const author = await Author.findOne({ name: book.author });
  const bookObj = new Book({ ...book, author: author._id });
  const saved = await bookObj.save();
  console.log(saved);
});
*/
const findAuthor = async () => {
  return await Author.findById("636ba28b1c87b02088f339af");
};

const author = findAuthor();

const book = {
  author: author._id,
  title: "Hello 132432",
  published: "1002",
  genres: ["kids", "cartoon"],
};

const bookObj = new Book(book);

const saveBook = async () => {
  const newBook = await bookObj.save();
  console.log(await newBook.populate("author"));
};

saveBook();
