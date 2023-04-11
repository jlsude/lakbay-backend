var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'lakbay_database'
});

connection.connect(function (error) {
    if (!!error) {
        console.log(error);
    }
    else {
        console.log('Lakbay Database is Connected!')
    }
});

module.exports = connection;