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

    editAuthor: async (root, args) => {
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
  },
};

module.exports = resolvers;
