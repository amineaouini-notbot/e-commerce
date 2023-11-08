require('dotenv').config()
let mysql = require('mysql')
let mysql2 = require('mysql2')
const {DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME} = process.env

var db = DB_HOST ? mysql2.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,  
}) : mysql.createConnection({
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