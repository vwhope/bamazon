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
function startBamazon() {
  
  // Display Menu (logo, options, exit and end connection)
  console.log ('     |========================|');
  console.log ('     |====  SHOP BAMAZON  ====|');
  console.log ('     |========================|\n');
  
  inquirer
  .prompt([
    // 
    {
      type: 'checkbox',
      message: '   What would you like to do?',
      choices: ['View products available for purchase', 'Purchase a product', 'Quit'],
      name: 'userSelection'
    }
  ]) 
  .then(function(processUserSelection) {
    
    // console.log(processUserSelection.userSelection); // ex. [Purchase an item]
    
    switch (processUserSelection.userSelection[0]) {
      case 'View products available for purchase':
      displayAllProducts();
      break;
      
      case 'Purchase a product':
      purchaseProduct();
      break;
      
      case 'Quit':
      endConnection();
      break;
      
    } // end switch
    
  }); // end of .then
  
} // end startBamazon


function menuOrQuit() {
  
  inquirer
  .prompt([
    // 
    {
      type: 'checkbox',
      message: '   What would you like to do?',
      choices: ['Return to Main Menu', 'Quit'],
      name: 'userNext'
    }
  ]) 
  .then(function(processUserNext) {
    
    // console.log(processUserNext.userNext); // ex. [Main menu or quit]
    
    switch (processUserNext.userNext[0]) {
      case 'Return to Main Menu':
      startBamazon();
      break;
      
      case 'Quit':
      endConnection();
      break;
      
    } // end switch
    
  }); // end of .then
  
} // END menuOrQuit



// Display product list so user knows what is available for purchase //
function displayAllProducts() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // console.log(res);
    console.log(columnify(res, {
      columns: ['item_id', 'product_name', 'price']
    }));
    console.log("\n");  
    //process.exit(); 
    menuOrQuit();     
    // purchaseProduct();
    //connection.end();
  });
  
}

// Get product and product quantity for purchase  
function purchaseProduct(whatProduct) {
  
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    // console.log(res);
    console.log(columnify(res, {
      columns: ['item_id', 'product_name', 'price']
    }));
    console.log("\n");  
    whatProduct();
  });
} // end purchaseProduct

function whatProduct() {
  
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
            
            printPurchaseTotal(answer.itemIdRequested, answer.quantityRequested);
            
          });  // end connection query
        } // end else
        
      } // end for loop
      
    }); // end query
    
  }); // end .then
  
}  // end whatProduct  



function printPurchaseTotal(item, quantity) {
  // console.log(item);
  // console.log(quantity);   
  
  var query = "SELECT * FROM products WHERE ?";
  connection.query(query,  { item_id: item },function(err, res) {
    if (err) throw err;
    console.log(columnify(res));
    // (qty * price) for item_id selected
    console.log(quantity);
    console.log(res[0].price);
    
    var totalPurchase = (quantity * (res[0].price));
    
    console.log("\n Total Purchase Price is: $" + totalPurchase);
    menuOrQuit();
  });
  
  // connection.end();
  
} // end printPurchaseTotal


function endConnection() {
  connection.end();
  console.log('Thank you for visiting Bamazon!');
  process.exit();
}

//
// ================================ BEGIN MAIN PROCESSING ====================================================================================
// 
// apply 'use strict' to entire program to throw errors in order to catch potential poor coding (ex. undefined variable)
'use strict';
// 
// 
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  startBamazon();
  
  // connection.end(); // when/where to end the connection?
});

///////////////////
// response object: 
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
////////////////////

