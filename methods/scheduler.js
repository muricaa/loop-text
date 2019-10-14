var sendText = require('./sms')
var userModel = require('./mongoose')

var schedule = require('node-schedule')

var savedSchedules = {}

userModel.find({}, (err, users) => {
    console.log(err, users)
    for(var x in users) {
        if(users[x].userSettings) {
            module.exports.schedule(users[x]._id)
        } else {
            continue
        }
    }
})

module.exports.schedule = function(id) {
    userModel.findOne({_id: id}, (err, user) => {
        if(user) {
            var time = user.userSettings.time.split(':')
            console.log(`scheduling text for ${time[0]}:${time[1]}`)
            var storedSched = savedSchedules[id]
            console.log(storedSched, 'saved schedule')
            if(storedSched) {
                console.log(storedSched)
                savedSchedules[id].cancel()
            }

            var rule = new schedule.RecurrenceRule()
            rule.dayOfWeek = [new schedule.Range(1,5)]
            rule.hour = time[0]
            rule.minute = time[1]
            
            savedSchedules[id] = schedule.scheduleJob(rule, () => {
                sendText(user._id)
            })
        } else {
            console.log('o no')
        }
    })
}