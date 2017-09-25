const request = require('superagent');
const databaseConfig = require("./config/databaseConfig.js");

const url = `${databaseConfig.url}`
const primaryKey = `${databaseConfig.primary_key}`
// const primaryKey = 'NnGUnatosykldCDs6m5Ma4tBGlb6Wyue912JLQ=='


// createToken()
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
                    console.log('Connection to database failed')
                    reject(err)
                }
            })
    });
};


// retrieveUserByID(2);
// retrieveUserByID(3);
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
                                console.log(res.body[counter])
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

// Find all transaction records
// Step 1: Connect to JE database with token
// Step 2: Retrieve all transactions from JE database

// /*TEST:*/ retrieveTransactions(); //

function retrieveTransactions() {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.get(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value)
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Retrieve Transaction: Transaction details retrieved successfully\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Retrieve Transaction: Invalid\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 404) {
                            console.log('Retrieve Transaction: Transaction not found\n')
                            resolve(res);
                        }else {
                            console.log('Retrieve Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

// Add transaction record
// Step 1: retrieve token
// Step 2: insert transaction into database

// 1 - Credit Card Payment
// 2 - Credit Card Chargeback
// 3 - Credit Card Refund

// 4 - Wallet Top-Up
// 5 - Walley Payment
// 6 - Wallet Refund

module.exports.createTransactionCreditPayment = createTransactionCreditPayment; // positive amount
module.exports.createTransactionCreditChargeback = createTransactionCreditChargeback; // negative amount
module.exports.createTransactionCreditRefund = createTransactionCreditRefund; // negative amount
module.exports.createTransactionWalletTopup = createTransactionWalletTopup; // positive amount
module.exports.createTransactionWalletPayment = createTransactionWalletPayment; // positive amount
module.exports.createTransactionWalletRefund = createTransactionWalletRefund; // negative amount

function createTransactionCreditPayment(fk_user_id, fk_merchant_id, fk_branch_id, braintree_transaction_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "fk_merchant_id": fk_merchant_id, // integer
                        "fk_branch_id": fk_branch_id, // integer
                        "braintree_transaction_id": braintree_transaction_id, // string
                        "transaction_amount": transaction_amount, // integer
                        "transaction_type": 1 // integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

function createTransactionCreditChargeback(fk_user_id, fk_merchant_id, fk_branch_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "fk_merchant_id": fk_merchant_id, // integer
                        "fk_branch_id": fk_branch_id, // integer
                        "transaction_amount": -transaction_amount, // integer
                        "transaction_type": 2 // integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

function createTransactionCreditRefund(fk_user_id, fk_merchant_id, fk_branch_id, braintree_transaction_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "fk_merchant_id": fk_merchant_id, // integer
                        "fk_branch_id": fk_branch_id, // integer
                        "braintree_transaction_id": braintree_transaction_id, // string
                        "transaction_amount": -transaction_amount, // integer
                        "transaction_type": 3 // integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

function createTransactionWalletTopup(fk_user_id, braintree_transaction_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "braintree_transaction_id": braintree_transaction_id, // string
                        "transaction_amount": transaction_amount, // integer
                        "transaction_type": 4 // integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

function createTransactionWalletPayment(fk_user_id, fk_merchant_id, fk_branch_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "fk_merchant_id": fk_merchant_id, // integer
                        "fk_branch_id": fk_branch_id, // integer
                        "transaction_amount": transaction_amount, // integer
                        "transaction_type": 5// integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

function createTransactionWalletRefund(fk_user_id, fk_merchant_id, fk_branch_id, transaction_amount) {
    return new Promise((resolve, reject) => {
        var promiseCreateToken = createToken();
        promiseCreateToken.then((value) => {

                request.post(url + '/transaction')
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + value) 
                    .send({
                        "fk_user_id": fk_user_id, // integer
                        "fk_merchant_id": fk_merchant_id, // integer
                        "fk_branch_id": fk_branch_id, // integer
                        "transaction_amount": -transaction_amount, // integer
                        "transaction_type": 6 // integer
                      })
                    .end((err, res) => {
                        if (res.statusCode >= 200 && res.statusCode <= 299) {
                            console.log('Create Transaction: Transaction Response\n')
                            resolve(res);
                        }
                        else if (res.statusCode == 400) {
                            console.log('Create Transaction: Invalid Transaction body\n')
                            resolve(res);
                        }else {
                            console.log('Create Transaction: Could not establish proper connection with database\n')
                            resolve(-1)
                        }
                    })
        })
    });
}

// createTransactionSucess('1', '1', '1', 'test', 100)

// customer_id, merchant_id, btTransaction_id, datetime, amount, order_id)
// function createTransactionSucess(user_id, merchant_id, branch_id, btTransaction_id, amount) {
//     return new Promise((resolve, reject) => {
//         var form = {
//             "fk_user_id": user_id,
//             "fk_merchant_id": merchant_id,
//             "fk_branch_id": branch_id,
//             "braintree_transaction_id": btTransaction_id,
//             "transaction_amount": amount,
//             "transaction_type": 1 // Sucess
//         }
//         var promiseCreateToken = createToken();
//         promiseCreateToken.then((token) => {

//             request.post(url + '/transaction')
//                 .set('Content-Type', 'application/json')
//                 .set('Accept', 'application/json')
//                 .set('Authorization', 'Bearer ' + token)
//                 .send(form)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     if (res.statusCode == 200) {
//                         console.log('Transaction Response\n')
//                         resolve(res);
//                     }
//                     else if (res.statusCode == 400) {
//                         console.log('Invalid Transaction body\n')
//                         resolve(res);
//                     }
//                 })

//         })
//     });
// }
// function createTransactionSucessWalletTop(user_id, btTransaction_id, amount) {
//     return new Promise((resolve, reject) => {
//         var form = {
//             "fk_user_id": user_id,
//             "braintree_transaction_id": btTransaction_id,
//             "transaction_amount": amount,
//             "transaction_type": 4 // Sucess Wallet Top Up
//         }
//         var promiseCreateToken = createToken();
//         promiseCreateToken.then((token) => {

//             request.post(url + '/transaction')
//                 .set('Content-Type', 'application/json')
//                 .set('Accept', 'application/json')
//                 .set('Authorization', 'Bearer ' + token)
//                 .send(form)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     if (res.statusCode == 200) {
//                         console.log('Transaction Response\n')
//                         resolve(res);
//                     }
//                     else if (res.statusCode == 400) {
//                         console.log('Invalid Transaction body\n')
//                         resolve(res);
//                     }
//                 })

//         })
//     });
// }
// function createTransactionSucessWalletPay(user_id, merchant_id,branch_id, amount) {
//     return new Promise((resolve, reject) => {
//         var form = {
//             "fk_user_id": user_id,
//             "fk_merchant_id": merchant_id,
//             "fk_branch_id": branch_id,
//             "transaction_amount": amount,
//             "transaction_type": 5 // Sucess Wallet Pay
//         }
//         var promiseCreateToken = createToken();
//         promiseCreateToken.then((token) => {

//             request.post(url + '/transaction')
//                 .set('Content-Type', 'application/json')
//                 .set('Accept', 'application/json')
//                 .set('Authorization', 'Bearer ' + token)
//                 .send(form)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     if (res.statusCode == 200) {
//                         console.log('Transaction Response\n')
//                         resolve(res);
//                     }
//                     else if (res.statusCode == 400) {
//                         console.log('Invalid Transaction body\n')
//                         resolve(res);
//                     }
//                 })

//         })
//     });
// }
// function createTransactionSucessWalletRefund(user_id, merchant_id,branch_id, amount) {
//     return new Promise((resolve, reject) => {
//         var form = {
//             "fk_user_id": user_id,
//             "fk_merchant_id": merchant_id,
//             "fk_branch_id": branch_id,
//             "transaction_amount": amount,
//             "transaction_type": 6 // Sucess Wallet Refund
//         }
//         var promiseCreateToken = createToken();
//         promiseCreateToken.then((token) => {

//             request.post(url + '/transaction')
//                 .set('Content-Type', 'application/json')
//                 .set('Accept', 'application/json')
//                 .set('Authorization', 'Bearer ' + token)
//                 .send(form)
//                 .end((err, res) => {
//                     console.log(res.body)
//                     if (res.statusCode == 200) {
//                         console.log('Transaction Response\n')
//                         resolve(res);
//                     }
//                     else if (res.statusCode == 400) {
//                         console.log('Invalid Transaction body\n')
//                         resolve(res);
//                     }
//                 })

//         })
//     });
// }


// Find transaction records by ID


////////////////////// all here v v v v v not for wallet and credit card ///

// Find transaction records by ID
// Step 1: Retrieve token
// Step 2: Retrieve transaction details from database by id

// /*TEST:*/ retrieveIdTransaction('8c31804e-2807-4b50-7795-08d4ffd71ce7'); /

module.exports.retrieveIdTransaction = retrieveIdTransaction;

function retrieveIdTransaction(transaction_id) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.get(url + '/transaction/' + transaction_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Retreive ID Transaction: Transaction record retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Retreive ID Transaction: Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Retreive ID Transaction: Transaction not found\n')
                        resolve(res);
                    }else{
                        console.log('Retreive ID Transaction: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Delete transaction record by ID
// Step 1: Retrieve token
// Step 2: Delete transaction from database by id

// /*TEST:*/ deleteIdTransaction('145a54d4-204b-4769-94ae-08d4fa64f6e5'); /

module.exports.deleteIdTransaction = deleteIdTransaction;

function deleteIdTransaction(transaction_id) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.delete(url + '/transaction/' + transaction_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Delete ID Transaction: Successfully deleted Transaction\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Delete ID Transaction: Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Delete ID Transaction: Transaction not found\n')
                        resolve(res);
                    }else{
                        console.log('Delete ID Transaction: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Find all settlements records
// Step 1: Retrieve token
// Step 2: Retrieve settlement records from JE database

// /*TEST:*/ retrieveSettlements(); /

module.exports.retrieveSettlements = retrieveSettlements;

function retrieveSettlements() {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.get(url + '/settlement')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Retrieve Settlements: Settlement details retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Retrieve Settlements: Invalid\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Retrieve Settlements: Settlement not found\n')
                        resolve(res);
                    }else{
                        console.log('Retrieve Settlements: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Add settlement record
// Step 1: Retrieve token
// Step 2: Add settlement records into JE database

//   "fk_merchant_id": 0,
//   "fk_branch_id": 0,
//   "fk_transaction_id": 0,
//   "settlement_amount": 0


// /*TEST:*/ createSettlement(fk_merchant_id, fk_branch_id, fk_transaction_id, settlement_amount); 

module.exports.createSettlement = createSettlement;

function createSettlement(fk_merchant_id, fk_branch_id, fk_transaction_id, settlement_amount) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.post(url + '/settlement')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .send({
                    "fk_merchant_id": fk_merchant_id, // integer
                    "fk_branch_id": fk_branch_id, // integer
                    "fk_transaction_id": fk_transaction_id, // integer
                    "settlement_amount": settlement_amount // integer
                })
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Create Settlement: Settlement Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Create Settlement: Invalid Settlement body\n')
                        resolve(res);
                    }else{
                        resolve(-1)
                    }
                })
    })
});
}
function createTransactionSucessWalletTop(user_id, btTransaction_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": -1,
            "fk_branch_id": -1,
            "braintree_transaction_id": btTransaction_id,
            "transaction_amount": amount,
            "transaction_type": 4 // Sucess Wallet Top Up
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

// Find settlement records by ID
// Step 1: Retrieve token
// Step 2: Retrieve settlement records from JE database by id

// /*TEST:*/ createToken();

module.exports.retrieveIdSettlement = retrieveIdSettlement;

function retrieveIdSettlement(settlement_id) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.get(url + '/settlement/' + settlement_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Retrieve ID Settlement: Settlement record retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Retrieve ID Settlement: Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Retrieve ID Settlement: Settlement not found\n')
                        resolve(res);
                    }else{
                        console.log('Retrieve ID Settlement: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}
// createTransactionSucessWalletPay(5, 12345, 1, 10)
function createTransactionSucessWalletPay(user_id, merchant_id, branch_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": merchant_id,
            "fk_branch_id": branch_id,
            "braintree_transaction_id": "walletTransactionPayment",
            "transaction_amount": amount,
            "transaction_type": 5 // Sucess Wallet Pay
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

// Delete settlement record by ID
// Step 1: Retrieve token
// Step 2: Delete settlement record from JE database by id

// /*TEST:*/ createToken();

module.exports.deleteIdSettlement = deleteIdSettlement;

function deleteIdSettlement(settlement_id) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.delete(url + '/settlement/' + settlement_id)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    console.log(res.body)
                    console.log(res.statusCode)
                    if (res.statusCode == 201) {
                        console.log('Transaction Response\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Delete ID Settlement: Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Delete ID Settlement: Settlement not found\n')
                        resolve(res);
                    }else{
                        console.log('Delete ID Settlement: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Update a transaction to completed status
// Step 1: Retrieve token
// Step 2: update confirmation to JE database by transaction id

/*
var form = {
"transaction_id": 0
}
function createTransactionSucessWalletRefund(user_id, merchant_id, branch_id, amount) {
    return new Promise((resolve, reject) => {
        var form = {
            "fk_user_id": user_id,
            "fk_merchant_id": merchant_id,
            "fk_branch_id": branch_id,
            "braintree_transaction_id": "walletTransactionRefund",
            "transaction_amount": -amount,
            "transaction_type": 6 // Sucess Wallet Refund
        }
        var promiseCreateToken = createToken();
        promiseCreateToken.then((token) => {

// /*TEST:*/ createToken();

module.exports.confirmTransaction = confirmTransaction;

function confirmTransaction(transaction_id) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.put(url + '/transaction/completed')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .send({ "transaction_id": transaction_id }) // "settlement_id" : `${settlement_id}`
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Confirm Transaction: Updated transaction\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Confirm Transaction: Invalid transaction\n')
                        resolve(res);
                    }else{
                        console.log('Confirm Transaction: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Find all merchants
// Step 1: Retrieve token
// Step 2: Retrieve merchant records from JE database

// /*TEST:*/ retrieveMerchants(); /

module.exports.retrieveMerchants = retrieveMerchants;

function retrieveMerchants() {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.get(url + '/merchant')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Retrieve Merchants: Merchant records retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Retrieve Merchants: Invalid\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Retrieve Merchants: Merchant not found\n')
                        resolve(res);
                    }else{
                        console.log('Retrieve Merchants: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Create merchant records in JE database
// Step 1: Retrieve token
// Step 2: Create merchant records


// "merchant_name": "string",
// "company_name": "string",
// "first_name": "string",
// "last_name": "string",
// "email": "string",
// "merchant_url": "string",
// "mobile_number": "string",
// "password": "string"


// /*TEST:*/ createMerchant(merchant_name, company_name, first_name, last_name, email, merchant_url, mobile_number, password); /

module.exports.createMerchant = createMerchant;

function createMerchant(merchant_name, company_name, first_name, last_name, email, merchant_url, mobile_number, password) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.post(url + '/merchant')
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value) 
                .send({
                    "merchant_name": merchant_name, // string
                    "company_name": company_name, // string
                    "first_name": first_name, // string
                    "last_name": last_name, // string
                    "email": email, // string
                    "merchant_url": merchant_url, // string
                    "mobile_number": mobile_number, // string
                    "password": password
                  })
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Create Merchant: Merchant account creation succeeded\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Create Merchant: Invalid Merchant body\n')
                        resolve(res);
                    }else {
                        console.log('Create Merchant: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Retrieve merchant details from JE database by id
// Step 1: Retrieve token
// Step 2: Retrieve merchant details

// /*TEST:*/ retrieveIdMerchant(11); /

module.exports.retrieveIdMerchant = retrieveIdMerchant;

function retrieveIdMerchant(merchantId) {
return new Promise((resolve, reject) => {
    var promiseCreateToken = createToken();
    promiseCreateToken.then((value) => {

            request.get(url + '/merchant/' + merchantId)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + value)
                .end((err, res) => {
                    if (res.statusCode >= 200 && res.statusCode <= 299) {
                        console.log('Step 2: Merchant record retrieved successfully\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 400) {
                        console.log('Step 2: Invalid ID supplied\n')
                        resolve(res);
                    }
                    else if (res.statusCode == 404) {
                        console.log('Step 2: User not found\n')
                        resolve(res);
                    }else{
                        console.log('Step 2: Could not establish proper connection with database\n')
                        resolve(-1)
                    }
                })
    })
});
}

// Get All Branch Account
// Step 1: Connect to JE database with token
// Step 2: Retrieve all branch accounts from JE database

// /*TEST:*/ retrieveBranches(); / 

module.exports.retrieveBranches = retrieveBranches;

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

// Create branch records in JE database
// Step 1: Retrieve token
// Step 2: Create branch records

// "branch_name": "string",
// "branch_address": "string",
// "branch_phone": "string",
// "branch_url": "string",
// "first_name": "string",
// "last_name": "string",
// "email": "string",
// "mobile_number": "string",
// "password": "string"


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

module.exports.createBranch = createBranch;

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

// Find branch account by ID
// Step 1: Retrieve token
// Step 2: Retrieve branch account from JE database by id

// /*TEST:*/ retrieveIdBranch(17); /

module.exports.retrieveIdBranch = retrieveIdBranch;

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

/* |||||   ||| /|||||||||\ /|||||||||\  |||    ||| /||||||| ||||||||| */
/* ||||||  ||| |||     |||     |||      |||    ||| |||      |||       */
/* ||| ||| ||| |||     |||     |||      |||    ||| |||||||| ||||||||| */
/* |||  |||||| |||     |||     |||      |||    |||      ||| |||       */
/* |||    |||| \|||||||||/     |||      \||||||||/ |||||||/ ||||||||| */

/////////////////////////////////////////////////////////////////////////////////////

// Update a settlement record 

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

//   /*TEST:*/ updateIdSettlement(settlement_id, fk_merchant_id, fk_branch_id, fk_transaction_id, settlement_amount);

module.exports.updateIdSettlement = updateIdSettlement;


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
// module.exports.createTransaction = createTransaction;
// module.exports.createTransactionSucess = createTransactionSucess;
module.exports.retrieveIdTransaction = retrieveIdTransaction;
module.exports.deleteIdTransaction = deleteIdTransaction;
module.exports.retrieveSettlements = retrieveSettlements;
module.exports.createSettlement = createSettlement;
// module.exports.createTransactionSucessWalletTop = createTransactionSucessWalletTop;
module.exports.updateIdSettlement = updateIdSettlement;
module.exports.deleteIdSettlement = deleteIdSettlement;
module.exports.confirmSettlement = confirmSettlement;
module.exports.createTransactionSucessWalletPay = createTransactionSucessWalletPay
module.exports.createTransactionSucessWalletRefund = createTransactionSucessWalletRefund


