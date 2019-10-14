var userModel = require('../methods/mongoose')
var sendText = require('../methods/sms')

module.exports = {
    textUser: function(id) {
        sendText(id)
    },

    deleteUser: function(id) {
        userModel.findOne({_id: id}).remove().exec()
    },
    
    checkUserAuth: function(cookie, callback, error) {
        userModel.findOne({
            'cookieToken': cookie
        }, (err, doc) => {
            if(err || !doc || !doc.isAdmin) {
                error(err)
            } else {
                callback(doc)
            }
        })
    }
}