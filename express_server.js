const express = require("express");
const app = express();
const port = 8080;// default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

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

app.get("/urls/:id", (req, res) => { //:id doesn't have to be id but req.params.XX has to match :XX and on the ejs file as well
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars);
  // console.log(req.params)

 });