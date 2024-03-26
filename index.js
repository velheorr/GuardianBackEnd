
const express = require('express');
require('dotenv').config()
const axios = require('axios')
var cors = require('cors')

const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator')


const Card = require('./models/Card')
const Order = require('./models/Order')
const  User = require('./models/User')

const {isLatLong} = require("validator");

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        app.listen(process.env.PORT, ()=> console.log(`server started: ${process.env.PORT}`)  )
    } catch (e){
        console.log(e)
        process.exit(1)
    }
}

start()


app.get('/api/cards', async (req, res) => {
    try {
        const cards = await Card.find()
        res.json(cards)
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find()
        res.json(orders)
    } catch (e) {
        res.status(500).json({error: e.message})
    }
})

app.get('/api/dasahboarddata', async (req, res) => {
    try{
        const x = (await axios.get("https://mail.grdn.ru:777/upp_hs_ap/hs/v3/GetBlocSales")).data.response.data

        res.json(x)
    }catch (e) {
        console.log(e)
    }
})

app.post('/api/order', body('name').isLength({min: 6}), body('phone').isNumeric(), async (req, res)=>{
    try {
        const errors = validationResult(req)
        const {name, phone} = req.body

        const checkUniqueName = await Order.findOne({ name: name })

        if (checkUniqueName){
            res.status(409).json({ message: 'name already exist' })
            return
        }

        if (!errors.isEmpty()){
            return res.status(400).json({success: false, errors: errors.array()})
        }

        const order = new Order({name, phone})
        await order.save()

        res.json({order})
    }catch (e) {
        res.status(500).send({message: e.message})
    }
})

app.post('/api/register', body('login').isEmail(), body('password').isLength({min: '4'}), async (req, res)=>{
    try {
        const errors = validationResult(req)
        const {login, password} = req.body

        const checkUniqueName = await User.findOne({ login: login })

        if (checkUniqueName){
            res.status(409).json({ message: 'name already exist' })
            return
        }

        if (!errors.isEmpty()){
            return res.status(400).json({success: false, errors: errors.array()})
        }


        const user = new User({login, password,  auth: {dashboard: false}})
        await user.save()

        res.json({user})
    }catch (e) {
        res.status(500).send({message: e.message})
    }
})

app.post('/api/login',async (req, res)=>{
    try {
        const {login, password} = req.body
        let answer = true
        const checkLogin = await User.findOne({'login': login, 'password': password, 'auth.dashboard': true})
        if (!checkLogin){
            answer = false
            res.status(401).json({ message: 'login or password incorrect' })
            return
        }
        res.json(answer)
    }catch (e) {
        res.status(500).send({message: e.message})
    }
})