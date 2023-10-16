const app = require('express')();
const db = require('./db/db')
app.get('/', (req, res)=>{
    res.send('server is working!')
})
const PORT = 3000
app.listen(PORT, ()=>{
    console.log('server works on port 3000!')
})