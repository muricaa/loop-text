var savedData = require(`${__dirname}/loggedData.json`)
var fs = require('fs')

var currentData = {
    "textsSent": savedData.textsSent,
    "totalViews": savedData.totalViews
}

module.exports = {
    plusOne: function(name) {
        currentData[name] += 1
        console.log(currentData)
        var stringData = JSON.stringify(currentData)
        console.log(stringData)
        fs.writeFileSync(`${__dirname}/loggedData.json`, stringData)
    }
}