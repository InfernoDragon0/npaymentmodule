const azure = require('azure-storage')
const customer = require('./customer.js');
var jeDatabase = require("./databaseFunctions.js")
// connection to queue 1
let AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=calebtestqueue;AccountKey=1hbmP/8F5WRK5V2qubfwKd3D0mpJD7uaiCxf7NUO0Czn5iklf9uOqIz/A3mYvYUcfouvWEZskszhV35QBVuuOg==;EndpointSuffix=core.windows.net'

module.exports.sendBotTransactionDetailsToTable = sendBotTransactionDetailsToTable;
module.exports.searchQueue1Storage = searchQueue1Storage;


var retryOperations = new azure.ExponentialRetryPolicyFilter();
var entGen = azure.TableUtilities.entityGenerator;

function sendBotTransactionDetailsToTable(genHash, address, payment, merchantID, clientID, branchID) {
    var tDetails = {
        PartitionKey: entGen.String('transactionUriHash'),
        RowKey: entGen.String(genHash),
        botAddress: entGen.String(address),
        paymentAmount: entGen.String(payment),
        merchantId: entGen.String(merchantID),
        branchId: entGen.String(branchID),
        clientId: entGen.String(clientID)
    };
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


        };
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
            var q2payment = result.paymentAmount._;
            var q2merchant = result.merchantId._;
            var q2clientid = result.clientId._;
            var q2savedAddress = result.botAddress._;
            var q2branch = result.branchID._;



            var cpromise = jeDatabase.retrieveBrainTreeToken(q2clientid);  // << change this
            cpromise.then(function (customertoken) {
                customer.openCustomerPay(sess, q2payment, customertoken, q2merchant, res, page, q2savedAddress,q2branch,q2clientid); //find customer, if customer not found overwrite but this should not happen
                sess["clientid"] = result.clientId._;
            });
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
