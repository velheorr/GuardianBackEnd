const {Schema, model} = require('mongoose')

const user = new Schema({
    login: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        required: true,
        type: String,
    },
    auth: {
        dashboard: {
            login: {
                type: Boolean,
                default: false
            },
        },
        iboard: {
            login: {
                type: Boolean,
                default: false
            },
        }
    }
})

module.exports = model('User', user)


