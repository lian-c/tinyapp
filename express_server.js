const express = require("express");
const app = express();
const port = 8080;// default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const result = [];
  for (let i = 0; i < 6; i ++){
    const index = Math.floor(Math.random() * (alphaNumeric.length))
    result.push(alphaNumeric[index])
  } return result.join("")
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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { //:id doesn't have to be id but req.params.XX has to match :XX and on the ejs file as well
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars);
  // console.log(req.params)  
});

app.post("/urls", (req, res) => {
  const newURL = {id: generateRandomString(), longURL: req.body.longURL,}
  res.render("urls_show", newURL);
  urlDatabase[newURL.id] = newURL.longURL
})

app.get("/u/:id", (req, res) => {
  longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
