const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username": "user", "password": "pass"}];

const isValid = (username)=>{ //returns boolean
    return users.some((user) => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Enter username and password."});
    } else if (!authenticatedUser(username, password)) {
        return res.status(401).json({message: "Invalid login. Check username and password."})
    } else {
        let accessToken = jwt.sign(
            {data: password},
            "access",
            {expiresIn: 60 * 60}
        );
        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Logged in successfully.");
    }
});

// Add a book review
// You have to give a review as a request query & it must get posted with the username (stored in the session) posted.
// If the same user posts a different review on the same ISBN, it should modify the existing review.
// If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN.
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];
    let username = req.session.authorization["username"];

    if (book) {
        let review = req.query.review;
        if (review) {
            book.reviews[username] = review;
            return res.send("Review added successfully.");
        } else {
            return res.status(400).json({message: "No review submitted."});
        }
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];
    let username = req.session.authorization["username"];

    if (book) {
        delete book.reviews[username];
        return res.send("Review deleted successfully.");
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
