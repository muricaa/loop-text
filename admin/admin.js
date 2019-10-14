var express = require('express')
var userModel = require('../methods/mongoose')
var methods = require('./methods')

var router = express.Router()

router.get('/', (req, res) => {
    console.log(req.cookies)
    if(!req.cookies.userToken) throw 'Not logged in'
    methods.checkUserAuth(req.cookies.userToken, (user) => {
        renderAdmin(res)
    }, (err) => {
        console.log('not an admin')
        res.redirect('/')
    })
})

router.get('/methods', (req, res) => {
    console.log(req.cookies)
    if(!req.cookies.userToken) throw 'Not logged in'
    methods.checkUserAuth(req.cookies.userToken, (user) => {
        renderMethods(res)
    }, (err) => {
        console.log('not an admin')
        res.redirect('/')
    })
})

router.get('/sendText', (req, res) => {
    console.log(req.query)
    if(!req.query.auth || !req.query.reciever) throw 'Not logged in or no reciever specified'
    methods.checkUserAuth(req.query.auth, (user) => {
        res.send('done')
        methods.textUser(req.query.reciever)
    })
})

router.get('/deleteUser', (req, res) => {
    if(!req.query.auth || !req.query.reciever) throw 'Not logged in or no reciever specified'
    methods.checkUserAuth(req.query.auth, (user) => {
        res.send('done')
        methods.deleteUser(req.query.reciever)
    })
})

function renderAdmin(res) {
    userModel.find({}, (err, docs) => {
        res.render('admin', {
            allUsers: JSON.stringify(docs),
            loggedData: JSON.stringify(require('../methods/loggedData.json'))
        })
    })
    
}

function renderMethods(res) {
    userModel.find({}, (err, docs) => {
        res.render('adminMethods', {
            allUsers: JSON.stringify(docs),
            loggedData: JSON.stringify(require('../methods/loggedData.json'))
        })
    })
}

module.exports = router