const app = require('express')();
const db = require('./db/db')

app.set('views', './views')
app.set('view engine', 'ejs')

app.get('/', (req, res)=>{
    res.render('Home.ejs')
})
const PORT = 3000
app.listen(PORT, ()=>{
    console.log('server works on port 3000!')
})