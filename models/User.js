const {Schema, model} = require('mongoose')

const user = new Schema({
    login: {type: String, unique: true,required: true},
    password: {type: String, required: true},
    auth: {
        dashboard: {type: Boolean, default: false}
    }
})

module.exports = model('User', user)


