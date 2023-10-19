const express = require('express')
const app = express();
const db = require('./db/db')
const userRouter = require('./routes/user')
const session = require('express-session')

require('dotenv').config()

app.use(express.urlencoded({ extended: false}))
app.set('views', './views')
app.set('view engine', 'ejs')
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}))

app.get('/', (req, res)=>{
    let {token} = req.session
    if (token) res.redirect('/user')
    res.render('Home.ejs', {token: false})
})

app.use('/user', userRouter)
const PORT = 5000
app.listen(PORT, ()=>{
    console.log('server works on port 5000!')
})