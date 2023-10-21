const express = require('express')
const app = express();
const db = require('./db/db')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
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
    if (req.session.token) {
        res.redirect('/user')
    } else {

        res.render('Home.ejs')
    }
})

app.use('/user', userRouter)
app.use('/admin', adminRouter)

const PORT = 5000
app.listen(PORT, ()=>{
    console.log('server works on port 5000!')
})