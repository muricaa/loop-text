var options = require('./options.json')
var schoolLoop = require('./methods/sl-methods')
var userModel = require('./methods/mongoose')
var scheduler = require('./methods/scheduler')
var adminRouter = require(`./admin/admin`)
var logger = require('./methods/logger')

var request = require('request')
var randomToken = require('random-token')
var bodyParser = require('body-parser')
var express = require('express')
var cookieParser = require('cookie-parser')
var ejs = require('ejs')
var bcrypt = require('bcrypt')
var twilio = require('twilio')(options.twilio.accountSID, options.twilio.secret)

var webServer = express()

webServer.use(bodyParser.urlencoded({ extended: false }))
webServer.use(bodyParser.json())
webServer.use(cookieParser())
webServer.use(express.static('public'))
webServer.set('view engine', 'ejs')
webServer.use('/admin', adminRouter)

webServer.get('/', (req, res) => {
    logger.plusOne('totalViews')
    console.log('/')
    if (req.cookies.userToken) {
        res.redirect('/profile')
    } else {
        getSchoolsList(schoolList => {
            res.render('login', { schools: schoolList })
        })
    }
})

webServer.get('/logout', (req, res) => {
    console.log('logout')
    logger.plusOne('totalViews')
    userModel.findOne({
        'cookieToken': req.cookies.userToken
    }, (err, user) => {
        if(!err || user) {
            user.cookieToken = undefined
            user.save().then(() => {
                res.clearCookie('userToken')
                res.redirect('/')
            })
        } else {
            res.clearCookie('userToken')
            res.redirect('/')
        }
    })
    
})

webServer.get('/profile', (req, res) => {
    logger.plusOne('totalViews')
    if (req.cookies.userToken) {
        userModel.findOne({
            'cookieToken': req.cookies.userToken,
        }, (err, user) => {
            if (!user || err) {
                res.clearCookie('userToken')
                res.redirect('/')
            } else {
                var newSchool = new schoolLoop({
                    token: user.userData.userToken,
                    school: user.school
                })
                newSchool.getCourses(user.userData.basicInfo.userID, (courseData) => {
                    console.log(user._id)
                    res.render('user', {
                        basicInfo: user.userData.basicInfo,
                        courses: JSON.stringify(courseData),
                        settings: JSON.stringify(user.userSettings),
                        admin: JSON.stringify(user.isAdmin)
                    })
                }, (err) => {
                    res.render('ohno')
                })
            }
        })
    } else {
        res.redirect('/')
    }
})

webServer.post('/updatesettings', (req, res) => {
    userModel.findOne({
        'cookieToken': req.cookies.userToken
    }, (err, user) => {
        if(err) {
            res.redirect('/')
        } else {
            user.userSettings = req.body
            user.save().then(() => {
                scheduler.schedule(user._id)
                res.redirect('/profile')
            })
        }
    })
})

webServer.post('/login', (req, res) => {
    userModel.findOne({
        'username': req.body.username,
    }, (err, user) => {
        if (user) {
            console.log(user)
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                console.log(result, req.body.password, user.password)
                if (result) {
                    user.cookieToken = randomToken(16)
                    console.log(user.cookieToken)
                    user.save().then(() => {
                        res.cookie('userToken', user.cookieToken)
                        res.redirect('/profile')
                    })
                } else {
                    res.render('ohno', {error: 'Incorrect password'})
                }
            })
        } else {
            var newSchool = new schoolLoop({
                username: req.body.username,
                password: req.body.password,
                school: req.body.school
            })
            newSchool.getUserID((userInfo) => {
                newSchool.getCourses(userInfo.userID, (classes) => {
                    var cookieToken = randomToken(16)
                    var newUser = new userModel({
                        username: req.body.username,
                        password: req.body.password,
                        phoneNum: req.body.phone,
                        school: req.body.school,
                        isAdmin: false,
                        cookieToken: cookieToken,
                        userData: {
                            basicInfo: userInfo,
                            userID: userInfo.userID,
                            userToken: newSchool.getToken()
                        }
                    })
                    newUser.save().then(() => {
                        res.cookie('userToken', cookieToken)
                        res.redirect('/profile')
                        twilio.messages.create({
                            to: req.body.phone,
                            from: options.twilio.phoneNum,
                            body: 'Hello! Add my contact so you know when I text you!',
                            mediaUrl: `${options.serverAdr}/contact.vcf`
                        }).then(message => console.log(message))
                    })
                }, (err) => {
                    res.render('ohno', {error: "School loop login incorrect"})
                })
            }, (err) => {
                res.render('ohno', {error: "School loop login incorrect"})
            })
        }
    })
})

function endRequest(res, response) {
    res.writeHead(200, { 'Content-Type': 'text/xml' })
    res.end(response.toString())
}

webServer.listen(1337)

function getSchoolsList(callback) {
    request({
        url: "https://lol.schoolloop.com/mapi/schools",
        method: "GET",
    }, function (err, res, body) {
        callback(body)
    })
}