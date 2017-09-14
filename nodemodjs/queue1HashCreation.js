const azure = require('azure-storage')
const customer = require('./customer.js');
var BTDatabaseFunction = require("./BTCosmosDB");
var deletingQueue = require('./queue1DeletingQueue');
// connection to queue 1
let AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=calebtestqueue;AccountKey=1hbmP/8F5WRK5V2qubfwKd3D0mpJD7uaiCxf7NUO0Czn5iklf9uOqIz/A3mYvYUcfouvWEZskszhV35QBVuuOg==;EndpointSuffix=core.windows.net'

module.exports.sendBotTransactionDetailsToTable = sendBotTransactionDetailsToTable;
module.exports.searchQueue1Storage = searchQueue1Storage;


var retryOperations = new azure.ExponentialRetryPolicyFilter();
var entGen = azure.TableUtilities.entityGenerator;

function sendBotTransactionDetailsToTable(genHash, address, payment, merchantID, clientID) {
    var cpromise = BTDatabaseFunction.insertTransaction(clientID, merchantID, 'Payment Pending', Date(), payment, 'OrderID');
    cpromise.then(function (value) {
        var transactionID = value;
        console.log("Test test :" + transactionID);
        var timeStamp1 = entGen.Int64(Date.now())
        var tDetails = {
            PartitionKey: entGen.String('transactionUriHash'),
            RowKey: entGen.String(genHash),
            botAddress: entGen.String(address),
            paymentAmount: entGen.String(payment),
            merchantId: entGen.String(merchantID),
            clientId: entGen.String(clientID),
            transactionId: entGen.String(transactionID),
            unixTimestamp: timeStamp1
        };
        deletingQueue.deleteQueue(genHash, timeStamp1);
        let tableSvc = azure.createTableService(AzureWebJobsStorage).withFilter(retryOperations);
        tableSvc.createTableIfNotExists('b2sTransactionDetails', function (error, result, response) {
            if (!error) {
                let tDetailsBuffer = new Buffer(JSON.stringify(tDetails)).toString('base64');
                tableSvc.insertEntity('b2sTransactionDetails', tDetails, function (error, result, response) {
                    if (!error) {
                        console.log("Entity insertion Succesful!");
                        console.log("-----");
                        console.log("Entity inserted: " + tDetails);
                    }
                    else {
                        console.log(error);
                    }
                });
                // Table exists or created
            }
            else {
                k

            };
        });
    });
};


//sendBotTransactionDetailsToTable("genhash1","address1","payment1","merchantID-1","clientID-1");

function searchQueue1Storage(hash, res, sess, page) {
    let tableSvc = azure.createTableService(AzureWebJobsStorage).withFilter(retryOperations);
    tableSvc.retrieveEntity('b2sTransactionDetails', 'transactionUriHash', hash, function (error, result, response) {
        if (!error) {
            // result contains the entity
            console.log("Search Result");
            console.log(result);
            var transactionid = result.transactionId._; //added transactionid
            var q2payment = result.paymentAmount._;
            var q2merchant = result.merchantId._;
            var q2clientid = result.clientId._;
            var q2savedAddress = result.botAddress._;
            var TimeoutTimer = result.unixTimestamp._ + 300000; // 5minutes
            var timeNow = Date.now();

            if (timeNow < TimeoutTimer) {
                var cpromise = BTDatabaseFunction.findBTtoken(q2clientid);
                cpromise.then(function (customertoken) {
                    customer.openCustomerPay(transactionid, sess, q2payment, customertoken, q2merchant, res, page, q2savedAddress); //find customer, if customer not found overwrite but this should not happen
                    sess["clientid"] = result.clientId._;
                    console.log("vars are " + customertoken + " q2payment " + q2payment + " q2merchant " + q2merchant + "q2address " + q2savedAddress);
                    console.log("Transaction id is " + transactionid);
                    console.log(TimeoutTimer);
                    console.log(result.unixTimestamp._);
                    console.log(Date.now());
                });
            } else {
                console.log(" HASH TIMED OUT ");
                console.log(TimeoutTimer);
                console.log(result.unixTimestamp._)
                console.log(Date.now());
                console.log(Date.now(1000));
            }

        }
        else {
            console.log("error has occured");
            console.log(error);
            // console.log("Error: Entity not found");
            // console.log("Hash Token: "+hash);
            if (result == null) {
                console.log("Error: Hash Entity not found");
                console.log("Hash Token: " + hash);
            }
        };
    });
};

// searchQueue1Storage('BwkJmH5VpPO1UIbdlfk6hRRNHJCHU9POzUU17%2B6wyh',"1",'1','1');

function deleEntityFromQueue1(hash) {
    var task = {
        PartitionKey: { '_': 'transactionDetail4Hash' },
        RowKey: { '_': hash }
    };
    let tableSvc = azure.createTableService(AzureWebJobsStorage).withFilter(retryOperations);
    tableSvc.deleteEntity('b2sTransactionDetails', task, function (error, response) {
        if (!error) {
            console.log("entity sucessfully deleted!");;
            // Entity deleted
        }
    });
};

//deleEntityFromQueue1("1");
