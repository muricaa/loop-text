var userModel = require('./mongoose')
var schoolLoop = require('./sl-methods')
var options = require('../options.json')
var logger = require('./logger')
var twilio = require('twilio')(options.twilio.accountSID, options.twilio.secret)

var twilioNumber = options.twilio.phoneNum

module.exports = function(userID) {
    console.log(`sending message to ${userID}`)
    userModel.findOne({
        '_id': userID
    }, (err, user) => {
        if(user || !err) {
            var school = new schoolLoop({
                token: user.userData.userToken,
                school: user.school,
                userID: user.userData.userID
            })
            school.getAssignments((homework) => {
                var finalString = 'Heres your homework for tonight: \n'

                var acceptBy = Date.now()
                var today = new Date()
                
                //If Friday add 2 days 
                if(today.getDay() == 5) {
                    acceptBy = acceptBy + (86400000*2)
                }

                if(parseInt(user.userSettings.daysBefore) == 0) {
                    user.userSettings.daysBefore = 1
                    user.save()
                }

                acceptBy = acceptBy + (parseInt(user.userSettings.daysBefore)*86400000)

                for(var x in homework) {
                    var dueDate = new Date(parseInt(homework[x].dueDate))
                    if(parseInt(homework[x].dueDate) < acceptBy && !sameDay(dueDate, today)) {
                        finalString += `${user.userSettings[homework[x].teacherID]}: ${homework[x].title} (${dueDate.getFullYear()}/${(dueDate.getMonth())+1}/${dueDate.getDate()})\n`
                    }
                }

                twilio.messages.create({
                    to: user.phoneNum,
                    from: twilioNumber,
                    body: finalString
                }).then(message => {
                    logger.plusOne('textsSent')
                })
            }, (err) => {
                twilio.messages.create({
                    to: user.phone,
                    from: twilioNumber,
                    body: 'I tried to send you your homework but something went wrong. :('
                })
            })
        }
    })
}

function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
}