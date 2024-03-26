const {Schema, model} = require('mongoose')

const card = new Schema({
    name: {type: String, required: true},
    category: {type: String, required: true},
    price: {type: Number, required: true}
})

module.exports = model('Card', card)