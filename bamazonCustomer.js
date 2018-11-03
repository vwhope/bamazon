////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  bamazonCustomer.js - MAIN ENTRY POINT for bamazon (a mysql-node app)   
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ================================ BEGIN GLOBAL and ENVIRONMENT VARIABLE DEFINITIONS =======================================================

var mysql = require('mysql');
var inquirer = require('inquirer');
var fs = require('fs');
var columnify = require('columnify');
var chalk = require('chalk');

// create a connection to database bamazon_DB (table: products)
var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'VH_13Root',
  database: 'bamazon_DB'
});

// ================================ BEGIN FUNCTION DEFINITIONS ===============================================================================
// 
function startBamazon() {
  
  // Display Menu (logo, options, exit and end connection)
  console.log (chalk.cyanBright('     |@@@@@@@@@@@@@@@@@@@@@@@@|'));
  console.log (chalk.cyanBright('     |====                ====|'))
  console.log (chalk.cyanBright('     |      SHOP BAMAZON      |'));
  console.log (chalk.cyanBright('     |========================|\n'));
  
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
      
    } // END switch
    
  }); // END .then
  
} // END startBamazon


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
  connection.query('SELECT * FROM products', function(err, res) {
    if (err) throw err;
    
    console.log(columnify(res, {
      columns: ['item_id', 'product_name', 'price']
    }));
    console.log('\n');  
    menuOrQuit();     
        
  });
} // END displayAllProducts


// Get user's product and product quantity for purchase  
function purchaseProduct() {
     
  inquirer
  .prompt([
    {
      name: 'itemIdRequested',
      type: 'input',
      message: 'Using list above, enter ITEM ID of product you want to purchase: ',
      validate: function(value) {
        if (isNaN(value) === false) { 
          return true;
        }
        return false; 
      }
    },
    {
      name: 'quantityRequested',
      type: 'input',
      message: 'How many units of product do you want to purchase? ',
      validate: function(value) {
        if (isNaN(value) === false) {
          return true;
        }
        return false;
      }
    }
  ])
  .then(function(answer) {

    var query = 'SELECT * FROM products WHERE ?';
    
    connection.query(query,  { item_id: answer.itemIdRequested },function(err, res) {
      
      if (err) throw err;
      console.log(chalk.cyanBright('\nStock quantity BEFORE purchase'));
        
      console.log(columnify(res, {
        columns: ['item_id', 'product_name', 'stock_quantity']
      }));
      console.log('\n');
   
      // user's product has been selected - check for sufficient quantity before updating stock_quanttity
      // there should only be one record retrieved, but will loop in case enhancements increase nbr records returned 
      for (var i = 0; i < res.length; i++) {
        
        if (res[i].stock_quantity < answer.quantityRequested) {
          console.log(chalk.redBright('Insufficient Inventory. There are only ' + res[i].stock_quantity + ' units available.'));
          menuOrQuit();
        } else { // update database record with new stock_quantity
          
          var newQuantity = (res[i].stock_quantity - answer.quantityRequested);
          var query = 'UPDATE products SET stock_quantity = ? WHERE item_id = ?';
          connection.query(query, [newQuantity, answer.itemIdRequested], function(err, res) {
            if (err) throw err;
           
            printPurchaseTotal(answer.itemIdRequested, answer.quantityRequested);
          });  // END connection query

        } // END else
        
      }; // END for loop
      
    }); // END connection query
    
  }); // END .then
  
}  // END purchaseProduct  


function printPurchaseTotal(item, quantity) {
    
  var query = 'SELECT * FROM products WHERE ?';
  connection.query(query,  { item_id: item },function(err, res) {
    if (err) throw err;
    
    console.log(chalk.cyanBright('\nStock quantity AFTER purchase'));
     
    console.log(columnify(res, {
      columns: ['item_id', 'product_name', 'stock_quantity']
    }));
    console.log('\n');
    
    var totalPurchase = (quantity * (res[0].price));
    
    console.log(chalk.cyanBright('\nYou purchased ' + quantity + ' unit(s) of ' + res[0].product_name + ' at $' + res[0].price));
    console.log(chalk.cyanBright('Total Purchase Price is: $' + totalPurchase + '\n\n'));
    menuOrQuit();
  });
  
} // END printPurchaseTotal


function endConnection() {
  connection.end();
  console.log(chalk.cyanBright('\nThank you for visiting Bamazon!\n'));
  process.exit();
} // END endConnection

//
// ================================ BEGIN MAIN PROCESSING ====================================================================================
// 
// apply 'use strict' to entire program to throw errors in order to catch potential poor coding (ex. undefined variable)
'use strict';
 
connection.connect(function(err) {
  if (err) throw err;
  console.log('connected as id ' + connection.threadId);
  startBamazon();
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

