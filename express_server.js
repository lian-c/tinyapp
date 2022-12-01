const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require('morgan');
app.use(cookieParser());
app.use(morgan('dev'));
const port = 8080;// default port 8080

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca", 
    userID: "userRandomID"
},
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
}
};
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "easytohack",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "12345678",
  }
};

const generateRandomString = () => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const result = [];
  for (let i = 0; i < 6; i ++) {
    const index = Math.floor(Math.random() * (alphaNumeric.length));
    result.push(alphaNumeric[index]);
  } return result.join("");
};

const getUserByEmail = (email) => {
  for (let id of Object.keys(users)) {
    // console.log(users[id].email)
    if (users[id].email === email) {
      // console.log(users[id]);
      return users[id];
    }
  }
  return null;
};


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

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
  const loggedUser = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, users, loggedUser};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.status(200);
  const loggedUser = req.cookies.user_id;
  if (!loggedUser){
    res.redirect("/login");
  }
  const templateVars = { users, loggedUser};
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  const loggedUser = req.cookies.user_id;
  if(!loggedUser){
    return res.status(401).send('401 - Please login in order to shorten URL.');
  }
  const newURL = {id: generateRandomString(), longURL: req.body.longURL, users, loggedUser};
  if (!newURL.longURL.includes("http")) {
    newURL.longURL = "http://" + newURL.longURL;
  }
  urlDatabase[newURL.id] = {longURL: newURL.longURL, userID: loggedUser}
  res.render("urls_show", newURL);
  res.status(200);
});
  
app.get("/urls/:id", (req, res) => { //:id doesn't have to be id but req.params.XX has to match :XX and on the ejs file as well
  const loggedUser = req.cookies.user_id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, users, loggedUser};
  if (templateVars.longURL === undefined){ //this means id invalid because no longURL
    return res.status(404).send("404 - Short URL ID not found, please go back and try again.")
  }
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  const loggedUser = req.cookies.user_id;
  const url = {id: req.params.id, longURL:urlDatabase[req.params.id].longURL, users,loggedUser};
  res.render("urls_show", url);
});
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (key === shortURL) {
      res.redirect(302, longURL);
      return;
    }
  }
  res.redirect(400,"/urls/new");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(301,"/urls");
});
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect(301,"/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const loggedUser = req.cookies.user_id;
  if (loggedUser){
    return res.redirect("/urls");
  }
  const templateVars = { users , loggedUser};
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    return res.status(404).send('Please check your email or password');
  }
  if (getUserByEmail(email)) {
    return res.status(404).send('This email has already been registered');
  }
  const id = generateRandomString();
  users[id] = {id, email, password};
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const loggedUser = req.cookies.user_id;
  if (loggedUser){
    return res.redirect("/urls");
  }
  const templateVars = { users , loggedUser};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email)) {
    if (getUserByEmail(email).password === password) {
      res.cookie("user_id", getUserByEmail(email).id);
      return res.redirect("/urls");
    } return res.status(403).send('403 - Incorrect password');
  }
  return res.status(403).send('403 - Email not found');
});