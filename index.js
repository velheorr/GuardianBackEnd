const express = require('express');
require('dotenv').config()
const axios = require('axios')
const cors = require('cors')

const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator')


const  User = require('./models/User')


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



/*DASHBOARD получить основные данные для графиков*/
app.get('/api/dasahboarddata', async (req, res) => {
    try{
        const x = (await axios.get("https://mail.grdn.ru:777/upp_hs_ap/hs/v3/GetBlocSales")).data.response.data

        res.json(x)
    }catch (e) {
        console.log(e)
    }
})

/*IBOARD Получить данные блока реализация*/
app.get('/api/iboardData', async (req, res) => {
    try{
        const x = (await axios.get("https://mail.grdn.ru:777/upp_hs_ap/hs/v3/GetSales")).data.response
        const xData = await x.data
        const xProjectTeam = await x.ProjectTeam
        let arr = [];

        const objectById = {};
        for (const object of xProjectTeam) {
            objectById[object.КодОбъекта] = object;
        }

        xData?.forEach(item => {
            let newItem = item['КодОбъекта']
            let x = Object.assign({}, item,objectById[newItem])
            arr.push(x)
        })
        res.json(arr)
    }catch (e) {
        console.log(e)
    }
})

/*Общая регистрация*/
app.post('/api/register',
    body('login').isEmail(),
    body('password').isLength({min: '4'}),
    body('name'),
    async (req, res)=>{
    try {
        const errors = validationResult(req)
        const {login, password, name} = req.body

        const checkUniqueName = await User.findOne({ login: login })

        if (checkUniqueName){
            return res.status(409).json({ message: 'name already exist' })
        }
        if (!errors.isEmpty()){
            return res.status(400).json({success: false, errors: errors.array()})
        }

        const user = new User({login, password,name, auth: {dashboard: {login: false}, iboard: {login: false}}})
        await user.save()

        const result = {id: 200,message: "Пользователь успешно зарегистрирован", name: name, login: login}

        /*res.json({user})*/
        res.json({result})
    }catch (e) {
        res.status(500).send({message: e.message})
    }
})

/*Общая авторизация */
app.post('/api/login',async (req, res)=>{
    try {
        const {login, password, from} = req.body

        const checkLogin = await User.findOne({'login': login, 'password': password})
        if (!checkLogin.auth[from].login){
            return res.status(401).json({ message: 'У вас нет доступа для входа в систему' })
        }
        if (checkLogin.auth[from].login){
            const result = {message: "Авторизация успешна", name: checkLogin.name, login: login}
            return res.json(result)
        } else {
            return res.status(401).json({ message: 'Неверный логин или пароль' })
        }
    }catch (e) {
        res.status(500).send({message: e.message})
    }
})


