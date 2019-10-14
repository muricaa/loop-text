var mongoose = require('mongoose')
var bcrypt = require('bcrypt')
var options = require('../options.json')

require('mongoose-function')(mongoose)

mongoose.connect(options.mongoURL)

const userSchema = mongoose.Schema({
    username: String,
    password: String,
    school: String,
    phoneNum: String,
    cookieToken: String,
    isAdmin: Boolean,
    userSettings: {},
    userData: {
        basicInfo: {},
        userID: String,
        userToken: String
    },
    schoolLoop: {},
})

userSchema.pre('save', function(next) {
    var user = this
    if(user.password.split('')[0] != '$') {
        bcrypt.hash(user.password, 10, (err, hash) => {
            if(err) return next(err)
            user.password = hash
            next()
        })
    } else {
        next()
    }
})

userModel = mongoose.model('User', userSchema)

module.exports = userModel