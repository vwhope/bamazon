////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  bamazonCustomer.js - MAIN ENTRY POINT for bamazon (a mysql-node app)   
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================================ BEGIN GLOBAL and ENVIRONMENT VARIABLE DEFINITIONS =======================================================

var mysql = require('mysql');
var inquirer = require('inquirer');
var fs = require('fs');
var columnify = require('columnify');

// create a connection to database bamazon_DB (table: products)
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "VH_13Root",
    database: "bamazon_DB"
});

// ================================ BEGIN FUNCTION DEFINITIONS ===============================================================================
// 
// Display product list so user knows what is available for purchase //
function displayAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        // console.log(res);
           console.log(columnify(res, {
                columns: ['item_id', 'product_name', 'price']
            }));
   console.log("\n");             
   purchaseProduct();
            // connection.end();
    });
   
}
    
// Get product and product quantity for purchase  
function purchaseProduct() {

    inquirer
    .prompt([
      {
        name: "itemIdRequested",
        type: "input",
        message: "Using list above, enter ITEM ID of product you want to purchase: ",
        validate: function(value) {
          if (isNaN(value) === false) { // data entered IS a number
            return true;
          }
          return false; // data entered is NOT a number
        }
      },
      {
        name: "quantityRequested",
        type: "input",
        message: "How many units of product do you want to purchase? ",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {
      var query = "SELECT * FROM products WHERE ?";
      connection.query(query,  { item_id: answer.itemIdRequested },function(err, res) {
        if (err) throw err;
// data before update
        console.log("\n");  
        console.log(columnify(res));
        console.log("\n");

       // now that you have the correct record in the database, check quantity to be sure there is enough for order
       // even though I know there should only be one record retrieved, I am looping in case enhancements increase nbr records returned 
        for (var i = 0; i < res.length; i++) {

            if (res[i].stock_quantity < answer.quantityRequested) {
                console.log("Insufficient Inventory. There are only " + res[i].stock_quantity + " units available.");
                connection.end();
            } else { // update database record with new stock_quantity
            
                var newQuantity = (res[i].stock_quantity - answer.quantityRequested);
                var query = "UPDATE products SET stock_quantity = ? WHERE item_id = ?";
                connection.query(query, [newQuantity, answer.itemIdRequested], function(err, res) {
                    if (err) throw err;

                    console.log("Inventory Updated Successfully");
                    // console.log("\n");  
                    // console.log(columnify(res));
                    // console.log("\n");

                    printPurchaseTotal(answer.itemIdRequested, answer.quantityRequested);

                });  
            } // end else
           
        } // end for loop
                
      }); // end query

    }); // end .then

}  // end purchaseProduct  

function printPurchaseTotal(item, quantity) {
 console.log(item);
 console.log(quantity);   
 console.log("Total Purchase Price is: ");

 // (qty * price) for item_id selected
 connection.end();

} // end printPurchaseTotal


//
// ================================ BEGIN MAIN PROCESSING ====================================================================================
// 
// apply 'use strict' to entire program to throw errors in order to catch potential poor code (ex. undefined variable)
'use strict';
// 
// 
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    displayAllProducts();
    
    // connection.end(); // when/where to end the connection?
});

///////////
// When will the result object look like this: ??
        // {
        //     fieldCount: 0,
        //     affectedRows: 1,
        //     insertID: 0,
        //     serverStatus: 34,
        //     warningCount: 0,
        //     message: '(Rows matched: 1 Changed: 1 Warnings: 0)',
        //     protocol41: true,
        //     changedRows: 1
        // }
