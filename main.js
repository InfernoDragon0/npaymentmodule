//please use main.js only for app.x so that it is cleaner
/**
 * Split the modules into parts, for node sided JS please put in
 * nodemodjs and use module.exports to #include functions here
 *
 * For client sided JS please put in js folder
 *
 * Remember, this is an API so calls should not rely too much on html
 */

var ejs = require('ejs'); //ejs is not express, but is a extension to express
var path = require("path"); //pathing system
var bodyParser = require('body-parser'); //parse POST data
var session = require('express-session'); //temporary to store sensitive data, see if theres better way
var authenticator = require("./nodemodjs/authenticator.js");
var BTDatabaseFunction = require("./nodemodjs/BTCosmosDB");
var queue1Function = require("./nodemodjs/queue1HashCreation");
const cvars = require("./nodemodjs/commonvariables.js");
const express = require('express'); //express is good
const app = express();
const customer = require('./nodemodjs/customer.js');
//const http = require('http'); //http stuff, not needed yet
//const fs = require('fs'); //filesystem, not needed yet
const port = 5000;

/**
 * uses ejs engine to eval HTML files (to use <%= %> variables)
 */
app.engine('html', require('ejs').renderFile);
app.use(session({
    secret: 'whatsecretshallweuse kitten',//session secret to sign sessions
    resave: true, //force save
    saveUninitialized: true,
    /*cookie: { secure: true }*/
})); //secure needs HTTPS, cookies will not be stored if running from HTTP with this option
app.use(bodyParser.json()); // supporting POST data
app.use(bodyParser.urlencoded({ extended: true })); // supportting POST data
/**
 * evals js/css/img folders for JS/CSS/image files
 */
app.use(express.static(path.join(__dirname, '/js')));
app.use(express.static(path.join(__dirname, '/css')));
app.use(express.static(path.join(__dirname, '/img')));

/**
 * listens to dynamic port if online, and local testing uses 5000
 */
app.listen(process.env.PORT || port);

app.get('/', function (req, res) { //base page
    res.render(path.join(__dirname + '/Home.html'));
});

/**
* API Description:
 * Authentication for 6 digit pins and users (not connected to database yet)
 *
 * user: the clientid to authenticate
 * pin: the pin to check against the clientid
 * now connected to real database
 */
app.post('/authenticate', function (req, res) { //base page
    if (!req.body.user || !req.body.pin || req.body.pin.length != 6) {
        res.send("Please input a userid and a 6 digits pin");
        return;
    }

    if (authenticator.checkAuthorized(req.session)) {
        res.send("Already Authorized. At " + req.session.authorized);
    }
    else {
        var promisething = authenticator.authRequest(req.session, req.body.user, req.body.pin);
        promisething.then((value) => {
            if (value) {
                res.send("Authorized. At " + req.session.authorized);
            }
            else {
                res.send("Invalid user and pin combination. try again!");
            }
        })
    }
});


/**
 * on start at localhost:3000/pay?amount=10.00 generate the token
 * Requires Bot to send the query via POST
 *
 * API Description:
 * This is the credit card request function
 *
 * amount: the amount to pay, 1 = $1.00
 * customer: the token from the customer
 * To use: send a request to localhost:3000/pay?amount=(amount)&customer=(token)&merchantid=(merchant)
 * Example Request: /pay?amount=300.00&customer=663573599&merchantid=123
 */
app.get('/pay', function (req, res) { //change to app.post once debug finish
    var sess = req.session;
    //if (!authenticator.checkAuthorized(sess)) {
    //    res.render(path.join(__dirname + '/Home.html'));
    //    return;
    //}//check auth later
    if (!req.query.amount || req.query.amount < 0.01 || !req.query.customer || !req.query.merchantid || !req.query.savedaddress) { //change to req.body if POST
        res.send("<p>Please provide amount, customer and merchantid to pay to</p>");
        return;
    }
    var page = path.join(__dirname + '/index.html');
    var randHash = authenticator.genRandomizedLink(req.query.amount, req.query.customer, req.query.merchantid, req.query.savedaddress);
    res.send(randHash);
    queue1Function.sendBotTransactionDetailsToTable(randHash,req.query.savedaddress,req.query.amount,req.query.merchantid,req.query.customer);
    //hash is the primary key*

    //var cpromise = BTDatabaseFunction.findBTtoken(req.query.customer);
    //cpromise.then(function(value) {
     //           customer.openCustomerPay(sess, req.query.amount, value, req.query.merchantid, res, page, req.query.savedAddress); //find customer, if customer not found overwrite but this should not happen

//    });
});

app.get('/payhash', function (req, res) { //TEST FUNCTION FOR HASH
    var sess = req.session;
    //if (!authenticator.checkAuthorized(sess)) {
    //    res.render(path.join(__dirname + '/Home.html'));
    //    return;
    //}//check auth later
    if (!req.query.hash) { //change to req.body if POST
        res.send("<p>Please provide a valid hash</p>");
        return;
    }
    var hash = encodeURIComponent(req.query.hash);
    var page = path.join(__dirname + '/index.html');
    //var cpromise = BTDatabaseFunction.findBTtoken(req.query.customer);
    // database.searchPayment(req.query.hash);
    queue1Function.searchQueue1Storage(hash, res,sess,page);
    // customer.openCustomerPay(sess, amount, customertoken, merchant, res, page, savedAddress); //find customer, if customer not found overwrite but this should not happen

});

app.post('/pay', function (req, res) {
    var sess = req.session;
    //if (!authenticator.checkAuthorized(sess)) {
    //    res.render(path.join(__dirname + '/Home.html'));
    //    return;
    //}//check auth later
    if (!req.body.amount || req.body.amount < 0.01 || !req.body.customer || !req.body.merchantid || !req.body.savedaddress) { //change to req.body if POST
        res.send("<p>Please provide amount, customer and merchantid to pay to</p>");
        return;
    }
    var page = path.join(__dirname + '/index.html');

    var randHash = authenticator.genRandomizedLink(req.body.amount + "", req.body.customer + "", req.body.merchantid + "", req.body.savedaddress + "");
    res.send(randHash);
    queue1Function.sendBotTransactionDetailsToTable(randHash,req.body.savedaddress,req.body.amount,req.body.merchantid,req.body.customer);

    //customer.openCustomerPay(sess, req.body.amount, value, req.body.merchantid, res, page, req.body.savedAddress); //find customer, if customer not found overwrite but this should not happen


});
/**
 * processpayment handler, customer.chargeCard for details
 */
app.post('/processpayment', function (req, res) {
    if (!req.body.transactionid || !req.body.amount || !req.body.nonce || !req.session.customer || !req.body.merchantid) {
        res.send("<p>Please provide transactionid, amount, nonce, customer token and merchantid</p>");
        return;
    }
    var storageAddress = req.session.storageAddress;
    console.log("storeaddress is " + storageAddress);
    customer.chargeCard(req.body.transactionid, req.body.amount, req.body.nonce, req.session.customer, req.body.merchantid, res, storageAddress, req.session);
});

app.post('/autopayment', function (req, res) {
    if (!req.body.amount || !req.body.customer || !req.body.merchantid) {
        res.send("<p>Please provide amount, customer token and merchantid</p>");
        return;
    }
    //swap customer for clientid
    var storageAddress = req.session.storageAddress;
    customer.autoChargeCard(req.body.amount, req.body.customer, req.body.merchantid, res, storageAddress);
});

/**
 * create customer handler, customer.createCustomer for details
 */
app.get("/create/customer", function (req, res) {
    if (!req.query.clientid || !req.query.contact_No || !req.query.pin) {
        res.send("<p>Please provide clientid, contactno, pin</p>");
        return;
    }
    customer.createCustomer(req.query.clientid, res, req.query.contact_No, req.query.pin);
});

app.get("/find/customer", function (req, res) {
    if (!req.query.clientid) {
        res.send("<p>Please provide clientid</p>");
        return;
    }
    var cpromise = BTDatabaseFunction.findBTtoken(req.query.clientid);
    cpromise.then(function(value) {
            console.log("test" + value);
            customer.retrieveCustomerCardDetails(value,res);
    });


});

/**
 * handles 404 errors here
 *
 * note that this has to be the last app.x function
 */
app.use(function (req, res, next) {
    res.status(404).send("You may not view this page. Please use localhost:3000/pay")
});
