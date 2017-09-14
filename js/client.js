var button = document.querySelector('#submit-button');
var http = new XMLHttpRequest();
braintree.dropin.create({
    authorization: clienttoken,
    container: '#dropin-container'
}, function (createErr, instance) {
    button.addEventListener('click', function () {
        if (createErr) {
         // Handle any errors that might've occurred when creating Drop-in 
         console.error(createErr);
         return;
        }
        instance.requestPaymentMethod(function (err, payload) {
            if (err) {
                alert("There is an error processing the card: " + err);
                console.error(err);
                return;
            }
            // Submit payload.nonce to your server
            console.log("payload is " + payload.nonce);
            sendPost("/processpayment", "amount=" + amount + "&nonce=" + payload.nonce + "&merchantid=" + merchantid + "&transactionid=" + transactionid);
        });
    });
});

function sendPost(url, params) {
http.open("POST", url, true);

//Send the proper header information along with the request
http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

http.onreadystatechange = function() {//Call a function when the state changes.
    if(http.readyState == 4 && http.status == 200) {
        document.write(http.responseText);
    }
}
http.send(params);
}
