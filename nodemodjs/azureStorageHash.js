const azure = require('azure-storage')
const customer = require('./customer.js');
const jeDatabase = require("./databaseFunctions.js")
// connection to queue 1
 
const AzureWebJobsStorageEndpoint= 'DefaultEndpointsProtocol=https;AccountName=jestorage;AccountKey=an5hL2LOUQd57VRQKxpQ8GGcQENyv+dAmGW+sDwGViKzeLGXCWV+rGWHq4PvOofWT4ABdceh+5VCikzAWvQFxQ==;EndpointSuffix=core.windows.net'
const tableName = 'paymentStateTable';

var retryOperations = new azure.ExponentialRetryPolicyFilter();
var entGen = azure.TableUtilities.entityGenerator;
// sendBotTransactionDetailsToTable("test","test","test","test","test","test")
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
    let tableSvc = azure.createTableService(AzureWebJobsStorageEndpoint).withFilter(retryOperations);
    tableSvc.createTableIfNotExists(tableName, function (error, result, response) {
        if (!error) {
            let tDetailsBuffer = new Buffer(JSON.stringify(tDetails)).toString('base64');
            tableSvc.insertEntity(tableName, tDetails, function (error, result, response) {
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
            console.log("test sucess")
        }
        else {


        };
    });

};


// sendBotTransactionDetailsToTable("genhash1","address1","payment1","merchantID-1","clientID-1");
// searchQueue1Storage("test","test","test","test")
function searchQueue1Storage(hash, res, sess, page) {
    let tableSvc = azure.createTableService(AzureWebJobsStorageEndpoint).withFilter(retryOperations);
    tableSvc.retrieveEntity(tableName, 'transactionUriHash', hash, function (error, result, response) {
        if (!error) {
            // result contains the entity
            console.log("Search Result");
            console.log(result);
            var q2payment = result.paymentAmount._;
            var q2merchant = result.merchantId._;
            var q2clientid = result.clientId._;
            var q2savedAddress = result.botAddress._;
            var q2branch = result.branchId._;



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
    let tableSvc = azure.createTableService(AzureWebJobsStorageEndpoint).withFilter(retryOperations);
    tableSvc.deleteEntity('b2sTransactionDetails', task, function (error, response) {
        if (!error) {
            console.log("entity sucessfully deleted!");;
            // Entity deleted
        }
    });
};

//deleEntityFromQueue1("1");
module.exports.sendBotTransactionDetailsToTable = sendBotTransactionDetailsToTable;
module.exports.searchQueue1Storage = searchQueue1Storage;

