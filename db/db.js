let mysql = require('mysql')

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = db