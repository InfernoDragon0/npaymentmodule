/**
 * node JS file for customer related stuff
 */
const cvars = require("./commonvariables.js");
var BTDatabasefunction = require("./BTCosmosDB");
var queue2PayDetails = require("./queue2PayDetails");

module.exports.chargeCard = chargeCard;
module.exports.autoChargeCard = autoChargeCard;
module.exports.openCustomerPay = openCustomerPay;
module.exports.createCustomer = createCustomer;
module.exports.retrieveCustomerCardDetails=retrieveCustomerCardDetails;
module.exports.openCustomerPayWithoutPage = openCustomerPayWithoutPage;

/**
 * API Description:
 * This is process payment method for single card charges
 *
 * amount: the amount to pay, 1 = $1.00
 * nonce: the card token to be charged
 * To use: send a request to localhost:3000/processpayment via POST
 * Example Request: /processpayment + POSTDATA{ amount: 50.00, nonce: "x", customertoken: "12345678" }
 *
 * @param transactionid
 * @param {*double} amount
 * @param {*string} nonce
 * @param customertoken
 * @param merchantid
 * @param {*var} res
 * @param storageAddress
 * @param sess
 */
function chargeCard (transactionid, amount,nonce,customertoken,merchantid,res,storageAddress, sess) {
    //use merchantid for database stuff
    cvars.gateway.transaction.sale({
        amount: amount,
        paymentMethodNonce: nonce,
        customerId: customertoken,
        options: {
            storeInVaultOnSuccess: true, //store the card with this customer on successful payment
            submitForSettlement: true //must submit for settlement to process payment, can set to false to settle later within 7 days
        }
    }, function (err, result) { //we can send the whole RESULT so that the bot can manually use the json data
        if(!err){
            if (result.success) {
                var braintreereceipt = result.transaction.id; //new braintree receipt id
                var last4digit = result.transaction.creditCard.last4;
                res.send("Payment of $" + amount + " has been made successfully. Payment is charged to card **** "+last4digit+" Thank you!");

                var transactionDetails = {cardLast4Digit : last4digit , transactionAmount : amount, transactionTimeStamp : Date.now() };

                queue2PayDetails.sendPayDetailsToQueueSucess(storageAddress,transactionDetails);
                BTDatabasefunction.paymentSucessful(transactionid,braintreereceipt);

                if (merchantid == -1) {
                    var id = sess["clientid"];
                    BTDatabasefunction.updateWalletAmount(id, amount);
                }
            }
            else if (!result.success && result.transaction) {
                res.send(result.transaction.status + ": " + result.transaction.processorResponseText);
            }
            else {
                res.send(result.errors.deepErrors());
            }
            console.log(result);
        } else {
            res.send(err);
            console.log(err);
        }
    });
}

function autoChargeCard (amount,customertoken,merchantid,res,storageAddress) {
    //use merchantid for database stuff
    cvars.gateway.transaction.sale({
        amount: amount,
        customerId: customertoken, //uses default payment method
        options: {
            submitForSettlement: true //must submit for settlement to process payment, can set to false to settle later within 7 days
        }
    }, function (err, result) { //we can send the whole RESULT so that the bot can manually use the json data
        if(!err){
            if (result.success) {
                var last4digit = result.transaction.creditCard.last4;
                res.send("Payment of $" + amount + " has been made successfully. Payment is charged to card **** "+last4digit+" Thank you!");
                //TODO add payment transaction history to database

                //var transactionDetails = {cardLast4Digit : last4digit , transactionAmount : amount, transactionTimeStamp : Date.now() };
                //queue2PayDetails.sendPayDetailsToQueueSucess(storageAddress,transactionDetails);
            }
            else if (!result.success && result.transaction) {
                res.send(result.transaction.status + ": " + result.transaction.processorResponseText);
            }
            else {
                res.send(result.errors.deepErrors());
            }
            console.log(result);
        } else {
            res.send(err);
            console.log(err);
        }
    });
}

/**
 * API Description:
 * Creates a customer token for the clientID that is given and stores it in the database
 * We do not need to store customer details on braintree as MongoDB will store the customer details already
 *
 * Call this upon Bot receiving a new account creation
 * When calling this more than once, the API will check if there is an existing
 * customerToken. If there is, the returned customer token will be ignored.
 *
 * Braintree side will store the client's name as clientID
 *
 * @param {*string} clientID the client's ID to link with the customertoken
 * @param {*var} res the res
 * @param contact_no
 * @param pin
 */
function createCustomer(clientID,res, contact_no, pin) {
    cvars.gateway.customer.create({firstName: clientID }, function (err, result) {
        if (!err) {
            if (result.success) {
                res.send("<p>Customer Token is: " + result.customer.id + "</p><p> Created for client ID " + clientID + "</p> contactno is " + contact_no + "pin is " + pin);
                //TODO: database stuff

                //database.addCustomer(customerid, customertoken) *** check if customer token exist, if exist try not to overwrite
                BTDatabasefunction.insertNewCustomer(clientID,result.customer.id,contact_no,pin);
            }
            else {
                res.send("Error occurred creating customer: " + result);
            }
        
        }
        else {
            res.send("API Error occurred: " + err);
        }
    });
}

/**
 * API Description:
 * Finds a customer, if found, open the page
 * 
 * 
 * 
 * @param {*string} customerToken the customertoken to retrieve card details from
 */
function openCustomerPay(transactionid, sess,amount,customerToken,merchantid,res,page,savedaddress) {
    cvars.gateway.customer.find(customerToken, function(err, customer) {
        if(!err){
            cvars.gateway.clientToken.generate({customerId: customerToken}, function (err, response) {
            sess.customer = customerToken;
            sess.storageAddress= savedaddress;
            console.log("is s" + sess.customer);
            console.log("test address : "+sess.storageAddress);
            res.render(page,
            {
            clientoken : response.clientToken,
            amount: amount,
            merchantid: merchantid,
            transactionid: transactionid
            });
        });
    }
        else {
            res.send("<p>Customer ID is not found, please try again. Error: " + err.type + " - " + err.message + "</p>");

            //this should not happen, but if customertoken got removed somehow, this will happen
            //maybe add a new token to this client if this happens
            console.log(err)
            
        };
});
}

function openCustomerPayWithoutPage(sess,amount,customerToken,merchantid,res,page) {
    cvars.gateway.customer.find(customerToken, function(err, customer) {
        if(!err){
            cvars.gateway.clientToken.generate({customerId: customerToken}, function (err, response) {
            console.log(response.clientToken);      
            sess.customer = customerToken;
            console.log("customer is " + sess.customer);
            res.render(page,
            {
            clientoken : response.clientToken,
            amount: amount,
            merchantid: merchantid
            });
        });
    }
        else {
            res.send("<p>Customer ID is not found, please try again. Error: " + err.type + " - " + err.message + "</p>");
            //this should not happen, but if customertoken got removed somehow, this will happen
            //maybe add a new token to this client if this happens
            console.log(err)
            
        };
});
}


function retrieveCustomerCardDetails(customerToken,res){
    cvars.gateway.customer.find(customerToken, function(err, customer) {
if(!err){
    // console.log("2: "+ JSON.stringify(customer.paymentMethods));
    // console.log ("first card"+ customer.paymentMethods.length);
    var cards = {}
    for(card in customer.paymentMethods){
        cards [card] = (customer.paymentMethods[card].last4);
    }
    console.log(JSON.stringify(cards));
    res.send("cards are " + JSON.stringify(cards));
}
    });
};
