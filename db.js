const mySql = require('mysql');
const fs = require('fs');
require('dotenv').config();


//use this in production
//ssl: {
// ca: fs.readFileSync("{ca-cert filename}")
//}
var connectionParams = {
    host: "mysql-gak-2023.mysql.database.azure.com",
    user: "gakadmin123",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    ssl: {
        rejectUnauthorized: false

    }
};
var db = mySql.createConnection(connectionParams);



db.connect();
module.exports = db;