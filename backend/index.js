const { ApolloServer, gql } = require("apollo-server");
const uuid = require("uuid");

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
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = gql`
  type Book {
    title: String!
    author: String!
    published: Int!
    genres: [String!]!
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(name: String, genre: String): [Book!]!
    allAuthors: [Author!]!
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

const resolvers = {
  Query: {
    bookCount: () => authors.length,
    authorCount: () => books.length,
    allBooks: (root, args) => {
      const author = args.name;
      const genre = args.genre;

      if (!author && !genre) {
        return books;
      }

      if (author) {
        return books.filter((book) => book.author === author);
      }

      if (genre) {
        return books.filter((book) => book.genres.includes(genre));
      }
    },
    allAuthors: () => authors,
  },

  Author: {
    bookCount: (root) => {
      const authorBooks = books.filter((book) => book.author === root.name);
      return authorBooks.length;
    },
  },

  Mutation: {
    addBook: (root, args) => {
      const newBook = { ...args, id: uuid.v1() };

      //create a new author if author not existing
      const existAuthor = authors.filter(
        (author) => author.name === newBook.author
      );

      if (existAuthor.length === 0) {
        const newAuthor = {
          name: newBook.author,
          id: uuid.v1(),
          born: null,
        };
        authors = authors.concat(newAuthor);
      }

      //create a new book
      books = books.concat(newBook);
      return newBook;
    },

    editAuthor: (root, args) => {
      const newData = {
        name: args.name,
        born: args.setBornTo,
      };

      const match = authors.filter((author) => author.name === newData.name);

      if (match.length !== 0) {
        authors = authors.map((author) =>
          author.name === newData.name
            ? { ...author, born: newData.born }
            : author
        );
        return newData;
      } else {
        return null;
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
