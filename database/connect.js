var mysql = require('mysql');

var con = mysql.createConnection({

    host : 'localhost',
    user : 'root',
    password : 'C111',
    database : 'WTP'
});

con.connect((err) => {
    if(err) throw err;
    console.log('Database Connected..');
});

module.exports = con;