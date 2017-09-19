const request = require('superagent');
const databaseConfig = require("./config/databaseConfig.js");

const url =`${databaseConfig.url}`
const primaryKey = `${databaseConfig.primary_key}`
// const primaryKey = 'NnGUnatosykldCDs6m5Ma4tBGlb6Wyue912JLQ=='



function createToken() {
    return new Promise((resolve, reject) => {
        // console.log(primaryKey)
        request.post(url + '/account/token')
            .set('Content-Type', 'application/json')
            .send({
                "primary_key": primaryKey
            })
            .end((err, res) => {
                console.log(res.statusCode);
                if (res.statusCode >= 200 && res.statusCode < 299) {
                    console.log("haha" + res.body.token);
                    resolve(res.body.token)
                } else if (res.statusCode == 401) {
                    console.log('Unauthorized')
                    resolve('unauthorized')
                } else {
                    console.log('err =', err);
                    reject(err)
                }
            })
    });
};


// retrieveUserByID(2);

function retrieveUserByID(userID) {
    return new Promise((resolve, reject) => {
        var openPromise = createToken(); //move this 2 below return new promise
        openPromise.then((value) => {
            request.get(url + '/user/' + userID)
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    console.log(res.statusCode);
                    if (res.statusCode >= 200 && res.statusCode < 299) {
                        // console.log("Retrieved Sucessfuly");
                        console.log(res.body)
                        resolve(res.body) // <<--- this one idk how
                    } else if (res.statusCode == 401) {
                        console.log('Unauthorized')
                        resolve('unauthorized')
                    } else {
                        console.log('err =', err);
                        reject(err)
                    }
                })
        });
    });
}

// createNewUserAccount("caleb12345","caleb","cheong","caleb@gmail.com","84828482","12345")
function createNewUserAccount(username, firstname, lastname, email, mobile_number, password) {
    return new Promise((resolve, reject) => {
        var openPromise = createToken();
        openPromise.then((value) => {
            request.post(url + '/user')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .send({
                    "username": username,
                    "first_name": firstname,
                    "last_name": lastname,
                    "email": email,
                    "mobile_number": mobile_number,
                    "password": password
                })
                .end((err, res) => {
                    console.log(res.statusCode);
                    if (res.statusCode >= 200 && res.statusCode < 299) {
                        console.log("User account sucessfully created");
                        console.log(res.body)
                        resolve(res.body)
                    } else if (res.statusCode == 401) {
                        console.log('Unauthorized')
                        resolve('unauthorized')
                    } else {
                        console.log('err =', err);
                        reject(err)
                    }
                })
        });
    });
}
// createNewBrainTreeAccount(4,'testBrainTreeID12345')
function createNewBrainTreeAccount(user_id, braintree_ID) {
    return new Promise((resolve, reject) => {
        var openPromise = createToken();
        openPromise.then((value) => {
            request.post(url + '/braintree')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .send({
                    "fk_user_id": user_id,
                    "braintree_user_id": braintree_ID
                })
                .end((err, res) => {
                    console.log(res.statusCode);
                    if (res.statusCode >= 200 && res.statusCode < 299) {
                        console.log("Braintree account sucessfully created, Linked to User :" + user_id);
                        console.log(res.body)
                        resolve(res.body)
                    } else if (res.statusCode == 401) {
                        console.log('Unauthorized')
                        resolve('unauthorized')
                    } else {
                        console.log('err =', err);
                        reject(err)
                    }
                })
        });
    });
}



function retrieveBrainTreeAccount(user_id) {
    return new Promise((resolve, reject) => {
        var found = 0 // 0 = no existing, 1=found
        var openPromise = createToken();
        openPromise.then((value) => {

            request.get(url + 'username, firstname, lastname/braintree')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    console.log(res.statusCode);
                    if (res.statusCode >= 200 && res.statusCode < 299) {

                        for (var counter = 0; counter < res.body.length; counter++) {
                            if (res.body[counter].fk_user_id == user_id) {
                                console.log(res.body[counter].fk_user_id)
                                console.log(res.body[counter].braintree_user_id)
                                found = 1
                                resolve(res.body[counter])
                            }
                        }
                        if (found == 0) {
                            console.log("No Braintree Account Found for User ID: " + user_id)
                            console.log("Please Create A Braintree Acount First")
                            resolve('No BrainTree Account found!')
                        } else if (found == 1) {
                            console.log("Retrieved Sucessfuly");
                            resolve('boo')
                        }

                    } else if (res.statusCode == 401) {
                        console.log('Unauthorized')
                        reject('unauthorized')
                    } else {
                        console.log('err =', err);
                        reject(err)
                    }
                })
        });
    });
};





// var test = retrieveBrainTreeToken(3)
// test.then((value)=>{
//     console.log(value)
// })
// retrieveBrainTreeToken(3)

function retrieveBrainTreeToken(user_id) {
    return new Promise((resolve, reject) => {
        var found = 0 // 0 = no existing, 1=found
        var openPromise = createToken();
        openPromise.then((value) => {

            request.get(url + '/braintree')
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    console.log(res.statusCode);
                    if (res.statusCode >= 200 && res.statusCode < 299) {

                        for (var counter = 0; counter < res.body.length; counter++) {
                            if (res.body[counter].fk_user_id == user_id) {
                                // console.log(res.body[counter].fk_user_id)
                                // console.log(res.body[counter].braintree_user_id)
                                found = 1
                                resolve(res.body[counter].braintree_user_id)
                            }
                        }
                        if (found == 0) {
                            console.log("No Braintree Account Found for User ID: " + user_id)
                            console.log("Please Create A Braintree Acount First")
                            resolve('No BrainTree Account found!')
                        } else if (found == 1) {
                            console.log("Retrieved Sucessfuly");
                            resolve('boo')
                        }

                    } else if (res.statusCode == 401) {
                        console.log('Unauthorized')
                        reject('unauthorized')
                    } else {
                        console.log('err =', err);
                        reject(err)
                    }
                })
        });
    });
};


////////////////////////////////////// phrase 2 ///////////////////////////////////////////////






//works but not in use // in case kenneth want primary key out of create token

// var promiseCreateToken = createToken(primary_key);

// promiseCreateToken.then((value)=>{
//     // console.log(value.statusCode)
//     if (value.statusCode == 200){
//     var promiseRetrieveTransactions = retrieveTransactions(value.body.token);
//     promiseRetrieveTransactions.then((value1)=>{
//         res.send(value);
//     })

//     }
//     else if (value.statusCode == 401){
//         res.send("Unauthorized");
//     }
//     else {
//         console.log(err)
//         res.send(err)
//     }

// })

// var primaryKey = "NnGUnatosykldCDs6m5Ma4tBGlb6Wyue912JLQ=="

// createToken(primaryKey);

// function createToken(primary_key) {
//     return new Promise((resolve, reject) => {

//         request.post(url + '/account/token')
//             .set('Content-Type', 'application/json')
//             .send({ "primary_key": primary_key })
//             .end((err, res) => {
//                 if (res.statusCode == 200) {
//                     console.log('Successful\n')
//                     resolve(res);
//                 }
//                 else if (res.statusCode == 401) {
//                     console.log('Unauthorized\n')
//                     resolve(res);
//                 }
//             })
//     });
// }

//retrieve all transactions

// module.exports.retrieveTransactions = retrieveTransactions;

// function retrieveTransactions(token) {
//     return new Promise((resolve, reject) => {
//       request.get(url + '/transaction')
//         .set('Content-Type', 'application/json')
//         .set('Accept', 'application/json')
//         .set('Authorization', 'Bearer ' + token)
//         .end((err, res) => {
//             if(res.statusCode == 200){
//                 console.log('Transaction details retrieved successfully\n')
//                 resolve(res.body);
//             }
//             else if(res.statusCode = 400){
//                 console.log('Invalid\n')
//                 resolve(res.statusCode);
//             }
//             else if(res.statusCode == 404){
//                 console.log('Transaction not found\n')
//                 resolve(res.statusCode);
//             }
//         })
//       });
//     }



// Find all transaction records


function retrieveTransactions() {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.GET(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    if (res.statusCode == 200) {
                        console.log('Transaction details retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Transaction not found\n')
                        resolve(res);
                    }
                })
        })
    });
}

// Add transaction record
/*
var form = {
    "fk_user_id": 0,
    "fk_merchant_id": 0,
    "fk_branch_id": 0,
    "braintree_transaction_id": "string",
    "transaction_amount": 0,
    "transaction_type": 0
}
*/



function createTransaction(form) {
    return new Promise((resolve, reject) => {

        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.POST(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(form)
                .end((err, res) => {
                    if (res.statusCode == 200) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid Transaction body\n')
                        resolve(res);
                    }
                })
        })
    });
}


// createTransactionSucess('1', '1', '1', 'test', 100)

// customer_id, merchant_id, btTransaction_id, datetime, amount, order_id)
function createTransactionSucess(user_id, merchant_id, branch_id, btTransaction_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": merchant_id,
            "fk_branch_id": branch_id,
            "braintree_transaction_id": btTransaction_id,
            "transaction_amount": amount,
            "transaction_type": 1 // Sucess
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.post(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(form)
                .end((err, res) => {
                    console.log(res.body)
                    if (res.statusCode == 200) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid Transaction body\n')
                        resolve(res);
                    }
                })

        })
    });
}
function createTransactionSucessWalletTop(user_id, btTransaction_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "braintree_transaction_id": btTransaction_id,
            "transaction_amount": amount,
            "transaction_type": 4 // Sucess Wallet Top Up
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.post(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(form)
                .end((err, res) => {
                    console.log(res.body)
                    if (res.statusCode == 200) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid Transaction body\n')
                        resolve(res);
                    }
                })

        })
    });
}
function createTransactionSucessWalletPay(user_id, merchant_id,branch_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": merchant_id,
            "fk_branch_id": branch_id,
            "transaction_amount": amount,
            "transaction_type": 5 // Sucess Wallet Pay
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.post(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(form)
                .end((err, res) => {
                    console.log(res.body)
                    if (res.statusCode == 200) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid Transaction body\n')
                        resolve(res);
                    }
                })

        })
    });
}
function createTransactionSucessWalletRefund(user_id, merchant_id,branch_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": merchant_id,
            "fk_branch_id": branch_id,
            "transaction_amount": amount,
            "transaction_type": 6 // Sucess Wallet Refund
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

            request.post(url + '/transaction')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .send(form)
                .end((err, res) => {
                    console.log(res.body)
                    if (res.statusCode == 200) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid Transaction body\n')
                        resolve(res);
                    }
                })

        })
    });
}


// Find transaction records by ID



function retrieveIdTransaction(transaction_id) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
            request.GET(url + '/transaction/' + transaction_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    if (res.statusCode == 200) {
                        console.log('Transaction record retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Transaction not found\n')
                        resolve(res);
                    }
                })
        })
    });
}

// Delete transaction record by ID



function deleteIdTransaction(transaction_id) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
            request.DELETE(url + '/transaction/' + transaction_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + token)
                .end((err, res) => {
                    if (res.statusCode == 204) {
                        console.log('Successfully deleted Transaction\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Transaction not found\n')
                        resolve(res);
                    }
                })
        })
    });
}

//Find all settlements records



function retrieveSettlements() {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.GET(url + '/settlement')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        if (res.statusCode == 200) {
                            console.log('Settlement details retrieved successfully\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 404) {
                            console.log('Settlement not found\n')
                            resolve(res);
                        }
                    })
        })
    });
}

// Add settlement record
/*
var form = {
    "fk_merchant_id": 0,
    "fk_branch_id": 0,
    "fk_transaction_id": 0,
    "settlement_amount": 0
}
*/



function createSettlement(form) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.POST(url + '/settlement')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .send(form)
                    .end((err, res) => {
                        if (res.statusCode == 200) {
                            console.log('Settlement Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid Settlement body\n')
                            resolve(res);
                        }
                    })
        })
    });
}

// Find settlement records by ID

function retrieveIdSettlement(settlement_id) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.GET(url + '/settlement/' + settlement_id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        if (res.statusCode == 200) {
                            console.log('Settlement record retrieved successfully\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid ID supplied\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 404) {
                            console.log('Settlement not found\n')
                            resolve(res);
                        }
                    })
        })
    });
}

// Update a settlement record // ? why need this
/*
var form = {
    "fk_merchant_id": 0,
    "fk_branch_id": 0,
    "fk_transaction_id": 0,
    "settlement_amount": 0
  }
  */



function updateIdSettlement(settlement_id, form) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.PUT(url + '/settlement/' + settlement_id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .send(form)
                    .end((err, res) => {
                        if (res.statusCode == 200) {
                            console.log('Updated settlement\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid Settlement body\n')
                            resolve(res);
                        }
                    })
        })
    });
}

// Delete settlement record by ID



function deleteIdSettlement(settlement_id) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.DELETE(url + '/settlement/' + settlement_id)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .end((err, res) => {
                        if (res.statusCode == 204) {
                            console.log('Successfully deleted Settlement\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid ID supplied\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 404) {
                            console.log('Settlement not found\n')
                            resolve(res);
                        }
                    })
        })
    });
}

// Update an completed status
/*
var form = {
    "settlement_id": 0
}
*/



function confirmSettlement(settlement_id) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {
                request.PUT(url + '/settlement/completed')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + token)
                    .send({ "settlement_id": settlement_id }) // "settlement_id" : `${settlement_id}`
                    .end((err, res) => {
                        if (res.statusCode == 200) {
                            console.log('Updated settlement\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Invalid settlement\n')
                            resolve(res);
                        }
                    })
        })
    });
}

module.exports.createToken = createToken;
module.exports.retrieveUserByID = retrieveUserByID;
module.exports.createNewUserAccount = createNewUserAccount;
module.exports.createNewBrainTreeAccount = createNewBrainTreeAccount;
module.exports.retrieveBrainTreeAccount = retrieveBrainTreeAccount;
module.exports.retrieveBrainTreeToken = retrieveBrainTreeToken;
module.exports.retrieveTransactions = retrieveTransactions;
module.exports.createTransaction = createTransaction;
module.exports.createTransactionSucess = createTransactionSucess;
module.exports.confirmSettlement = confirmSettlement;
module.exports.retrieveIdTransaction = retrieveIdTransaction;
module.exports.deleteIdTransaction = deleteIdTransaction;
module.exports.retrieveSettlements = retrieveSettlements;
module.exports.createSettlement = createSettlement;
module.exports.createTransactionSucessWalletTop = createTransactionSucessWalletTop;
module.exports.updateIdSettlement = updateIdSettlement;
module.exports.deleteIdSettlement = deleteIdSettlement;
module.exports.confirmSettlement = confirmSettlement;
module.exports.createTransactionSucessWalletPay= createTransactionSucessWalletPay
module.exports.createTransactionSucessWalletRefund=createTransactionSucessWalletRefund


