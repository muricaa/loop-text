var request = require('request')

const YEAR = new Date().getFullYear()
const SLVERSION = '3'

module.exports = class schoolLoop {
    constructor(options) {
        if(options.token) {
            this.token = options.token
        } else {
            this.token = Buffer.from(`${options.username}:${options.password}`).toString('base64')
        }
        this.school = options.school
        this.userID = options.userID
        console.log(this)
    }

    getToken() {
        return this.token
    }

    validateUser(callback) {
        request({
            url: `https://${this.school}/mapi/login?version=${SLVERSION}&year=${YEAR}`,
            method: "GET",
            headers: {
                "Authorization": `Basic ${this.token}`
            }
        }, function(err, res, body) {
            if(res.statusCode == 200) {
                callback(true, JSON.parse(body))
            } else {
                callback(false)
            }
        })
    }

    getSchoolsList(callback, error) {
        request({
            url: "https://lol.schoolloop.com/mapi/schools",
            method: "GET",
        }, function(err, res, body) {
            try {
                var parsedData = JSON.parse(body)
                callback(parsedData)
            } catch {
                error(body)
            }
            
        })
    }

    getUserID(callback, error) {
        request({
            url: `https://${this.school}/mapi/login?version=${SLVERSION}&year=${YEAR}`,
            method: "GET",
            headers: {
                "Authorization": `Basic ${this.token}`
            }
        }, function(err, res, body) {
            try {
                var parsedData = JSON.parse(body)
                callback(parsedData)
            } catch {
                error(body)
            }
        })
    }

    getCourses(studentID, callback, error) {
        request({
            url: `https://${this.school}/mapi/report_card?studentID=${studentID}`,
            method: "GET",
            headers: {
                "Authorization": `Basic ${this.token}`
            }
        }, function(err, res, body) {
            try {
                var parsedData = JSON.parse(body)
                callback(parsedData)
            } catch {
                error(body)
            }
        })
    }

    getGrades(periodID, callback, error) {
        request({
            url: `https://${this.school}/mapi/progress_report?studentID=${this.userID}&periodID=${periodID}`,
            method: "GET",
            headers: {
                "Authorization": `Basic ${this.token}`
            }
        }, function(err, res, body) {
            try {
                var parsedData = JSON.parse(body)
                callback(parsedData)
            } catch {
                error(body)
            }
        })
    }

    getAssignments(callback, error) {
        request({
            url: `https://${this.school}/mapi/assignments?studentID=${this.userID}`,
            method: "GET",
            headers: {
                "Authorization": `Basic ${this.token}`
            }
        }, function(err, res, body) {
            try {
                var parsedData = JSON.parse(body)
                callback(parsedData)
            } catch {
                error(body)
            }
        })
    }
}