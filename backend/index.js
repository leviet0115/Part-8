require("dotenv").config();
const uuid = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const { ApolloServer, gql } = require("apollo-server");
const book = require("./models/book");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = gql`
  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]!
    allBooks(name: String, genre: String): [Book!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

/* 
querry




  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!

  }
  */

const resolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    authorCount: async () => await Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const author = args.name;
      const genre = args.genre;

      if (!author && !genre) {
        return await Book.find({}).populate("author");
      }

      if (author) {
        const auth = await Author.findOne({ name: author });
        return await Book.find({ author: auth._id }).populate("author");
      }

      if (genre) {
        return await Book.find({ genres: genre }).populate("author");
      }
    },
    allAuthors: async () => await Author.find({}),
  },

  Author: {
    bookCount: async (root) => {
      const authorBooks = await Book.find({ author: root.id });
      return authorBooks.length;
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      //create a new author if author not existing
      const book = { ...args };
      const existAuthor = await Author.findOne({ name: book.author });

      if (existAuthor) {
        book.author = existAuthor._id;
      } else {
        const authObj = new Author({ name: book.author });
        const newAuthor = await authObj.save();
        book.author = newAuthor._id;
      }

      //create a new book
      const bookObj = new Book(book);
      const newBook = await bookObj.save();
      return await newBook.populate("author");
    },

    editAuthor: async (root, args) => {
      try {
        const updatedAuth = await Author.findOneAndUpdate(
          { name: args.name },
          {
            born: Number(args.setBornTo),
          },
          { new: true }
        );
        return updatedAuth;
      } catch (error) {
        return error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
