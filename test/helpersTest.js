const { assert } = require('chai');

const {getUserByEmail, urlsForUser} = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlTest = {
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
  },
  "t3e3as": {
    longURL: "http://www.example.com",
    userID: "userRandomID"
  },"vfh7ja": {
    longURL: "http://www.redflagdeals.com",
    userID: "user2RandomID"
  },
};



describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers).id;
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
});

describe('getUserByEmail', function() {
  it('should return null as no email passing', function() {
    const user = getUserByEmail("user321@example.com", testUsers);
    console.log(user);
    const expectedUserID = null;
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });
});

describe('urlsForUser', function() {
  it('should return object with all links that matches the user', function() {
    const urls = urlsForUser("userRandomID", urlTest);
    const expectedUrls = {
      b2xVn2: 'http://www.lighthouselabs.ca',
      t3e3as: 'http://www.example.com'
    };
    // Write your assert statement here
    assert.deepEqual(urls, expectedUrls);
  });
});
  
describe('urlsForUser', function() {
  it('should return empty object as no user in our database to be added', function() {
    const urls = urlsForUser("user321@example.com", urlTest);
    const expectedUserID = {};
    // Write your assert statement here
    assert.deepEqual(urls, expectedUserID);
  });
});