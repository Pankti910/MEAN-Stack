var mysql = require("mysql");

var con = mysql.createConnection({
  host: "localhost",
  database: "university-students",
  port: 3306,
  user: "root",
  password: "",
});

module.exports = con;
