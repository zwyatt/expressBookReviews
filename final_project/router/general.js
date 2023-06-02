const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and/or password missing."});
    } else if (users.some((user) => user.username === username)) {
        return res.status(400).json({message: "Username already exists."});
    } else {
        let user = {
            "username": username,
            "password": password
        };
        users.push(user);
        return res.status(200).json({message: `User ${username} successfully registered. You may now log in.`});
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let book = books[req.params.isbn];
  
  if (book) {
      return res.send(JSON.stringify(book, null, 4));
  } else {
      return res.send(`Book with ISBN ${req.params.isbn} not found.`);
  }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let arrayBooks = Object.entries(books);
    let authorBooks = [];
    arrayBooks.forEach(([isbn, book]) => {
        if (book.author === author) {
            authorBooks.push(book);
        }
    });

    if (authorBooks.length > 0) {
        return res.send(JSON.stringify(authorBooks, null, 4));
    } else {
        return res.send(`No books by ${author} found.`);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let arrayBooks = Object.entries(books);
    let titleBooks = [];
    arrayBooks.forEach(([isbn, book]) => {
        if (book.title === title) {
            titleBooks.push(book);
        }
    });

    if (titleBooks.length > 0) {
        return res.send(JSON.stringify(titleBooks, null, 4));
    } else {
        return res.send(`No books with title ${title} found.`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    let book = books[isbn];

    if (book) {
        return res.send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.send(`No books found with ISBN ${isbn}.`);
    }
});

module.exports.general = public_users;
