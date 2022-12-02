const express = require("express");
const cookieSession = require('cookie-session');
const app = express();
const morgan = require('morgan');
const bcrypt = require("bcryptjs");
const {getUserByEmail, urlsForUser, generateRandomString} = require('./helpers.js');

//middleware
app.use(cookieSession({
  name: 'session',
  keys: ["beluga"],// secret keys

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours for cookies to stay if not logged out 
}));
app.use(morgan('dev'));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
const port = 8080;// default port 8080
// All the databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }, "9fe9js": {
    longURL: "http://www.cheese.ca",
    userID: "user2RandomID"
  }
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "$2a$10$hD8vsFGCo7OqltkfOA3OH.ne0dcOi30702KC4920GVg93VY8uuE7m", //password easytohack typing it for testing purpose
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2a$10$hD8vsFGCo7OqltkfOA3OH.rdf6hJuUWPyLLF3TjjW1RrXYqBIzrXW", //password 12345678
  }
};



// app.get and post
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const loggedUser = req.session.user_id;
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to view this page.');
  }
  const userLinks = urlsForUser(loggedUser,urlDatabase);
  const templateVars = { urls: userLinks, users, loggedUser};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.status(200);
  const loggedUser = req.session.user_id;
  if (!loggedUser) {
    res.redirect("/login");
  }
  const templateVars = { users, loggedUser };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const loggedUser = req.session.user_id;
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to shorten URL.');
  }
  const newURL = { id: generateRandomString(), longURL: req.body.longURL, users, loggedUser };
  if (!newURL.longURL.includes("http")) {
    newURL.longURL = "http://" + newURL.longURL;
  }
  urlDatabase[newURL.id] = { longURL: newURL.longURL, userID: loggedUser };
  res.render("urls_show", newURL);
  res.status(200);
});

app.get("/urls/:id", (req, res) => { //:id doesn't have to be id but req.params.XX has to match :XX and on the ejs file as well
  const loggedUser = req.session.user_id;
  const id = req.params.id;
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to view this page');
  }

  const templateVars = { id, longURL: urlDatabase[id], users, loggedUser };
  
  if (templateVars.longURL === undefined) { //this means id invalid because no longURL
    return res.status(404).send("404 - Short URL ID not found, please go back and try again.");
  }
  if (urlsForUser(loggedUser,urlDatabase)[id]) { // if it's true
    return res.render("urls_show", templateVars);
  }
  return res.status(401).send('401 - You are not authorized to view this page');
});

app.post("/urls/:id", (req, res) => {
  const loggedUser = req.session.user_id;
  const id = req.params.id;
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to view this page');
  }

  const url = { id, longURL: urlDatabase[id].longURL, users, loggedUser };
  
  if (url.longURL === undefined) { //this means id invalid because no longURL
    return res.status(404).send("404 - Short URL ID not found, please go back and try again.");
  }
  if (urlsForUser(loggedUser,urlDatabase)[id]) { // if it's true
    return res.render("urls_show", url);
  }
  return res.status(401).send('401 - You are not authorized to view this page');
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (key === shortURL) {
      const longURL = urlDatabase[shortURL].longURL;
      res.redirect(302, longURL);
      return;
    }
  }
  res.redirect(400, "/urls/new");
});

app.post("/urls/:id/delete", (req, res) => {
  const loggedUser = req.session.user_id;
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    return res.status(404).send("404 - Short URL ID not found, please check the ID.");
  }
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to view this page');
  }
  if (urlsForUser(loggedUser,urlDatabase)[shortURL]) { // if it's true
    delete urlDatabase[shortURL];
    res.redirect(301, "/urls");
  }
  return res.status(401).send('401 - You are not authorized to delete this URL');
});

app.post("/urls/:id/edit", (req, res) => {
  const loggedUser = req.session.user_id;
  const shortURL = req.params.id;
  if (urlDatabase[shortURL] === undefined) {
    return res.status(404).send("404 - Short URL ID not found, please check the ID.");
  }
  if (!loggedUser) {
    return res.status(401).send('401 - Please login in order to edit this URL');
  }
  if (urlsForUser(loggedUser,urlDatabase)[shortURL]) { // if it's true
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect(301, "/urls");
  }
  return res.status(401).send('401 - You are not authorized to edit this URL');
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const loggedUser = req.session.user_id;
  if (loggedUser) {
    return res.redirect("/urls");
  }
  const templateVars = { users, loggedUser };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt); //hash the password
  if (email === "" || password === "") {
    return res.status(404).send('Please check your email or password');
  }
  if (getUserByEmail(email,users)) {
    return res.status(404).send('This email has already been registered');
  }
  const id = generateRandomString();
  users[id] = { id, email, password }; //saves the hash p/w
  // console.log(users) password hashed
  req.session.user_id = id;
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const loggedUser = req.session.user_id;
  if (loggedUser) {
    return res.redirect("/urls");
  }
  const templateVars = { users, loggedUser };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  if (getUserByEmail(email,users)) {
    if (bcrypt.compareSync(req.body.password,(getUserByEmail(email,users).password))) { //order is important
      req.session.user_id =  getUserByEmail(email,users).id;
      return res.redirect("/urls");
    } return res.status(403).send('403 - Incorrect password');
  }
  return res.status(403).send('403 - Email not found');
});