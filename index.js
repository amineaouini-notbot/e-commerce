const app = require('express')();
const db = require('./db/db')
const userRouter = require('./routes/user')
app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    res.render('Home.ejs')
})

app.use('/user', userRouter)
const PORT = 3000
app.listen(PORT, ()=>{
    console.log('server works on port 3000!')
})