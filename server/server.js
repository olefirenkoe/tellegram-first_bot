require('dotenv').config()

const axios = require('axios')
const express = require('express')
const sequelize = require('../db/db')
const app = express()
const port = 3000

const base_url = 'https://api.telegram.org/bot'

const User = require('../models/users')

const Message = require('../telegram/message')
const message = new Message()

app.use(require('body-parser').json())

app.get('/', (req, res) => {
    console.log(req.query)
    res.send(process.env.BOT_TOKEN)
})

app.post('/:token/setWebhook', (req, res) => {
  if (req.params.token === process.env.BOT_TOKEN){
    axios.post(base_url + process.env.BOT_TOKEN + '/setWebhook', {url: req.body.url})
        .then((r) => {
            console.log(r)
            res.send('Success')
        })
        .catch((error) => {
            console.log(error)
            res.status(400).send('error')
        })
  }else{
      res.status(400).send("Wrong bot token")
  }   
})

app.post('/handler/', async (req, res) => {

    if(req.body.message !== undefined){
        const user = await User.findOne({where: {telegram_id: req.body.message.from.id}})
        if (user === null) {
            await User.create({
                first_name: req.body.message.from.first_name,
                last_name: req.body.message.from.last_name,
                username: req.body.message.from.username,
                telegram_id: req.body.message.from.id,
            })
        }else {
            console.log(user.dataValues.id + ' sent some massage')
        }

        axios.post(base_url + process.env.BOT_TOKEN + '/sendMessage', 
        {chat_id: req.body.message.chat.id, text: "Hello", reply_markup: message.getInlineKeyboardMarkup("test")})
        .then((r) => {
            res.send('Success')
        })
        .catch((error) => {
            console.log(error)
            res.status(400).send('error')
        })
    }else if (req.body.callback_query !== undefined) {
        console.log(req.body.callback_query.data)
    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

module.exports = sequelize