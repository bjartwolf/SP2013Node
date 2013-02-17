
The strategy for SharePoint is mostly taken from here, but it has been 
modified a bit.

https://github.com/QuePort/passport-sharepoint

todo... a lot of stuff
Stub out the authorization server and decouple all the things

a keys.js file should contain secret keys for app and cookie-signing
```javascript
    // do not add this to git, it contains sercets and ids
    // should be added to git ignore
    // yeah, and these are all fake secrets...
    var clientID = "17b74aca-d3b1-39a5-b11a-892043384b3a";
    var clientSecret = "Lbac16P1mX+amQjmfP2psKMahsfnTbsJKzv19jLi4b0=";
    var cookieSecret = "thisisfreakinghardtoguess";
    module.exports = {"clientID" : clientID,
                      "clientSecret" : clientSecret,
                      "cookieSecret" : cookieSecret};
```


