const express = require('express')
const app = express();
const db = require('./db/db')
const userRouter = require('./routes/user')

require('dotenv').config()

app.use(express.urlencoded({ extended: false}))
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    res.render('Home.ejs')
})

app.use('/user', userRouter)
const PORT = 5000
app.listen(PORT, ()=>{
    console.log('server works on port 5000!')
})