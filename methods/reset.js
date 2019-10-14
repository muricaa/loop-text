var userSchema = require('./mongoose')

console.log('Deleting all data on the database')
userSchema.find({}).remove().exec()