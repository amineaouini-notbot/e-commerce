let mysql = require('mysql')

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "ecom"
});

db.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});

module.exports = db