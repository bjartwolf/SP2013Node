Start a new git repo without the keys in it

Stub out the authorization server and decouple all the things

a keys.js file should contain secret keys for app and cookie-signing
    // do not add this to git, it contains sercets and ids
    // should be added to git ignore
    // yeah, and these are all fake secrets...
    var clientID = "17b74aca-d3b1-39a5-b11a-892043384b3a";
    var clientSecret = "Lbac16P1mX+amQjmfP2psKMahsfnTbsJKzv19jLi4b0=";
    var cookieSecret = "thisisfreakinghardtoguess";
    module.exports = {"clientID" : clientID,
                      "clientSecret" : clientSecret,
                      "cookieSecret" : cookieSecret};


