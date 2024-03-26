const {Schema, model} = require('mongoose')

const order = new Schema({
    name: {type: String, required: true, unique: true},
    phone: {type: Number, required: true},
})

module.exports = model('Order', order)