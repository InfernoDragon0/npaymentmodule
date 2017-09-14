const storageAzure = require('azure-storage')
const AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=jiraffeteststorage;AccountKey=aojV/ZUm2XJWgE31TYp4SK4igk5/6UVCjn+fagDG0Hr0BemXs9PipCJy5Sca+VwpaT7eYLozaCDL9YHyCdq9AA==;EndpointSuffix=core.windows.net'
// test link to caleb azure storage , dele in finnal
// let AzureWebJobsStorage = 'DefaultEndpointsProtocol=https;AccountName=calebqueue2paydetails;AccountKey=w7+891eT6+cDqnFdTiZ9SkvDgvMrMujlt/FHd7uer7lOSDovJOwJQhoGPwsEgC+Kw/R/B/rkRg89CxYX8Mj/Bg==;EndpointSuffix=core.windows.net'
// let successMessage = { address: 'get address from bot', type: 'PAY_SUCCESS', text: 'send necessary details' };
// let failureMessage = { address: 'get address from bot', type: 'PAY_FAILURE', text: 'send necessary details' }; // json text : card details , amount

module.exports.sendPayDetailsToQueueSucess = sendPayDetailsToQueueSucess;
module.exports.sendPayDetailsToQueueFailure = sendPayDetailsToQueueFailure;

//Send pay details to azure queue if pay is sucess 
function sendPayDetailsToQueueSucess(storageAddress, transactionDetails) {
    let queueMessage = { address: storageAddress, type: 'PAY_SUCCESS', text: transactionDetails };

    let queueSvc = storageAzure.createQueueService(AzureWebJobsStorage);
    queueSvc.createQueueIfNotExists('payqueue', function (err, result, response) {
        if (!err) {
            // success here

            let queueMessageBuffer = new Buffer(JSON.stringify(queueMessage)).toString('base64');
            queueSvc.createMessage('payqueue', queueMessageBuffer, function (err, result, response) {
                if (!err) {
                } else {
                    // error adding message to queue
                    console.log("Error sending queue");
                    console.log("details =" + JSON.stringify(queueMessage));
                }
            });
        } else {
            // error creating queue
            console.log("Error creating queue");
            console.log(JSON.stringify(err));
        }
    });
};

function sendPayDetailsToQueueFailure(storageAddress, transactionDetails) {
    let queueMessage = { address: storageAddress, type: 'PAY_FAILURE', text: transactionDetails };

    let queueSvc = storageAzure.createQueueService(AzureWebJobsStorage);
    queueSvc.createQueueIfNotExists('payqueue', function (err, result, response) {
        if (!err) {
            let queueMessageBuffer = new Buffer(JSON.stringify(queueMessage)).toString('base64');
            queueSvc.createMessage('payqueue', queueMessageBuffer, function (err, result, response) {
                if (!err) {
                    // success here
                } else {
                    // error adding message to queue

                    console.log("Error sending queue");
                    console.log("details =" + JSON.stringify(queueMessage));
                }
            });
        } else {
            // error creating queue
            console.log("Error creating queue");
            console.log(JSON.stringify(err));
        }
    });
};

