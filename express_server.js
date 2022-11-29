const express = require("express");
const app = express();
const port = 8080;// default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const result = [];
  for (let i = 0; i < 6; i ++) {
    const index = Math.floor(Math.random() * (alphaNumeric.length));
    result.push(alphaNumeric[index]);
  } return result.join("");
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
  const templateVars = { urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.status(200);
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => { //:id doesn't have to be id but req.params.XX has to match :XX and on the ejs file as well
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // Object.values(urlDatabase).forEach((url) => { //if url is already shortened
  //   if (req.body.longURL === url) {
  //     res.redirect("/urls");
  //   }
  //   return;
  // });
  const newURL = {id: generateRandomString(), longURL: req.body.longURL,};
  if (!newURL.longURL.includes("http")) {
    newURL.longURL = "http://" + newURL.longURL;
  }
  res.render("urls_show", newURL);
  urlDatabase[newURL.id] = newURL.longURL;
  res.status(200);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const keys = Object.keys(urlDatabase);
  for (let key of keys) {
    if (key == shortURL) {
      res.redirect(longURL);
      return;
    }
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.status(200).redirect("/urls");
});
