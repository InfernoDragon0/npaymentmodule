/**
 * Authenticator to do 6 digit pin and 2FA things
 */

var fakepinAuths = {"1" : "wUKw1LaFWay2weUen7Ru6PMNfLMJp3o375Ie4R6VHWw=", "2" : "v1r2UoZHJtDuMSRufnsv68sLuNYlEyS5kNjFqy6ap70=", "3" : "g+e+RBczVGl5XME9OvPu+c5jw/YllUkoY2aOR01EnsI="};
var timetoexpire = 15 * 60;
var crypto = require('crypto');
var encryption = 'sha256';
var database = require('./BTCosmosDB.js');

module.exports.checkAuthorized = checkAuthorized;
module.exports.authRequest = authRequest;
module.exports.genRandomizedLink = genRandomizedLink;

function checkAuthorized(session) { //doesnt do anything yet cos no session stuff added
    var timenow = Math.floor(Date.now() / 1000);
    if (timenow - session["authorized"] < timetoexpire) {
        return true;
    }
    else {
        return false;
    }
}

function authRequest(sess, user, pin) {
        return new Promise((resolve, reject) => {
            var promisething = database.retrievePinandContactNo(user);
            promisething.then((value) => {
                var hashverify = crypto.createHash('sha256').update(pin).digest('base64');
                if (hashverify == value[0]) {
                    sess["authorized"] = Math.floor(Date.now() / 1000); //sets current time as authorized timing
                    resolve(true);
                }
                else {
                    resolve(false);
                }
        });
    })

}

function genRandomizedLink(proc1,proc2,proc3,proc4) {
    var hash1 = crypto.createHash('sha256').update(proc1 + proc2).digest('base64');
    var hash2 = crypto.createHash('sha256').update(proc3 + proc4).digest('base64');
    var chars = hash1 + Date.now + hash2;

    var a = chars.split(""),
        len = a.length;

    for(var i = len - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    var randomed = crypto.createHash('sha256').update(a.join("")).digest('base64');
    return encodeURIComponent(randomed.substr(0, randomed.length - 1));
}
