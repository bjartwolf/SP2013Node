
The strategy for SharePoint is mostly taken from here, but it has been 
modified a bit.

https://github.com/QuePort/passport-sharepoint

todo... a lot of stuff
Stub out the authorization server and decouple all the things

a keys.js file should contain secret keys for app and cookie-signing
```javascript
    var clientID = "17b74aca-d3b1-39a5-b11a-892043384b3a";
    var clientSecret = "Lbac16P1mX+amQjmfP2psKMahsfnTbsJKzv19jLi4b0=";
    var cookieSecret = "thisisfreakinghardtoguess";
    module.exports = {"clientID" : clientID,
                      "clientSecret" : clientSecret,
                      "cookieSecret" : cookieSecret};
```
when using nodejitsu, like I do, you can run
```shell
    jitsu env set clientID "17b74aca-d3b1-39a5-b11a-892043384b3a"
    jitsu env set clientSecret "Lbac16P1mX+amQjmfP2psKMahsfnTbsJKzv19jLi4b0=";
    jitsu env set cookieSecret "thisisfreakinghardtoguess";
```
