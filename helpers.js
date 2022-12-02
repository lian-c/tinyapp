const getUserByEmail = (email, database) => {
  for (let id of Object.keys(database)) {
    // console.log(users[id].email)
    if (database[id].email === email) {
      // console.log(users[id]);
      return database[id];
    }
  }
  return null;
};

const generateRandomString = () => {
  const alphaNumeric = "abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const result = [];
  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * (alphaNumeric.length));
    result.push(alphaNumeric[index]);
  } return result.join("");
};



const urlsForUser = (id,database) => { //enter userID and use new variable that can be changed keeping the id, longURL
  let result = {};
  for (let user of Object.keys(database)) {
    if (database[user].userID === id) {
      result[user] = database[user].longURL;
    }
  } return (result);
};
module.exports = {getUserByEmail, urlsForUser, generateRandomString}