/**
 * card.js file for credit card related stuff
 */

module.exports.deleteCard = deleteCard;
module.exports.addCard = addCard;

 function deleteCard(customer, cardId) {
    gateway.paymentMethod.delete("theToken", function (err) {});
 }

 function addCard(customer) {
    gateway.paymentMethod.create({
    customerId: "12345",
    paymentMethodNonce: nonceFromTheClient
    }, function (err, result) { });
 }

