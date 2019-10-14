# loop-text

To use:

1. Have a MongoDB instance running
2. Have a School Loop account (may be hard)
3. Create options.json with this format:

```
{
    "twilio": {
        "accountSID": "ACCOUNT SID",
        "secret": "ACCOUNT SECRET",
        "phoneNum": "PHONE NUMBER ON ACCOUNT"
    },
    "serverAdr": "http://YOURIP:YOURPORT",
    "mongoURL": "mongodb://MONGODB IP:MONGODB PORT/MONGODB DB"
}
```

4. Run `yarn install`
5. Run `node server.js`
