const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const jwt = require("jsonwebtoken");
const { GraphQLError } = require("graphql");

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const resolvers = {
  Query: {
    dummy: () => 0,
    bookCount: async () => {
      return Book.collection.countDocuments();
    },
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (!args.author && !args.genre) {
        return Book.find({}).populate("author");
      }

      if (args.genre) {
        return Book.find({ genres: args.genre }).populate("author");
      }
    },

    allAuthors: async () => {
      return Author.find({});
    },

    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author, bookCount: 1, born: null });
      } else {
        author.bookCount += 1;
      }

      const newBook = new Book({ ...args, author: author._id });

      try {
        await newBook.save();
        await author.save();
      } catch (error) {
        throw new GraphQLError(`Error saving book: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            error,
          },
        });
      }

      newBook.author = author;

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },

    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new GraphQLError("not authenticated", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const editedAuthor = await Author.findOne({ name: args.name });

      if (!editedAuthor) {
        return null;
      }

      try {
        editedAuthor.born = args.setBornTo;
        return await editedAuthor.save();
      } catch (error) {
        throw new GraphQLError(`Error editing author: ${error.message}`, {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.name,
            error,
          },
        });
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new GraphQLError("Creating the user failed", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
    },
  },
};

module.exports = resolvers;
