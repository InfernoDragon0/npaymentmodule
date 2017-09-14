var http = new XMLHttpRequest();

function sendAuthRequest() {
    var user = document.getElementById('userid').value;
    var pin = document.getElementById('pin').value;

    if (pin.length != 6) {
        return;
    }

    sendPost("/authenticate", "user=" + user + "&pin=" + pin);
}

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