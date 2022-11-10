require("dotenv").config();
const uuid = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");
const {
  ApolloServer,
  UserInputError,
  AuthenticationError,
} = require("apollo-server");
const book = require("./models/book");
const typeDefs = require("./graphql/typeDefs");
const { argsToArgsConfig } = require("graphql/type/definition");
const jwt = require("jsonwebtoken");
const SECRET = "password is password";
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

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
    addBook: async (root, args, context) => {
      //check authentication
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      //create a new author if author not existing
      const book = { ...args };
      const existAuthor = await Author.findOne({ name: book.author });

      if (existAuthor) {
        book.author = existAuthor._id;
      } else {
        const authObj = new Author({ name: book.author });
        try {
          const newAuthor = await authObj.save();
        } catch (error) {
          throw UserInputError(error.message, { invalidArgs: args });
        }
        book.author = newAuthor._id;
      }

      //create a new book
      const bookObj = new Book(book);
      try {
        const newBook = await bookObj.save();
        return await newBook.populate("author");
      } catch (error) {
        throw UserInputError(error.message, { invalidArgs: args });
      }
    },

    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }
      const filter = { name: args.name };
      const data = { born: args.setBornTo };
      const after = { new: true };
      try {
        const updatedAuth = await Author.findOneAndUpdate(filter, data, after);
        return updatedAuth;
      } catch (error) {
        throw UserInputError(error.message, { invalidArgs: args });
      }
    },

    createUser: async (roote, args) => {
      if (!args.username && !args.favouriteGenre) {
        return null;
      }

      const userObj = new User({ ...args });
      const newUser = await userObj.save();
      return newUser;
    },

    login: async (root, args) => {
      const existingUser = await User.findOne({ username: args.username });

      if (!existingUser || args.password !== "password") {
        throw new UserInputError("wrong credential");
      }

      const tokenUser = {
        username: existingUser.username,
        id: existingUser._id,
      };

      const token = { value: jwt.sign(tokenUser, SECRET) };
      return token;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
