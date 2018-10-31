// bamazon - using mysql, node.js

var mysql = require('mysql');
var inquirer = require('inquirer');
var fs = require('fs');
var columnify = require('columnify');


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "VH_13Root",
    database: "bamazon_DB"
    
});


connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayAllProducts();
    // connection.end();
});



function displayAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // console.log(res);
           console.log(columnify(res, {
                columns: ['item_id', 'product_name', 'price']
            }));
            
            connection.end();
    });
}
    
    
    