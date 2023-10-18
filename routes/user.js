const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db/db')

router.get('/signup', (req, res)=>{
    res.render('signup', {username: '', emai: '', password: ''})
})

router.post('/signup', (req, res)=>{
    console.log(req.body)
    bcrypt.hash(req.body.password, 10, (err, hash)=>{
        if (err) throw err;
        
        const {username, email} = req.body;
        db.query('INSERT INTO client (username, email, password, created_at) VALUES (?, ?, ?, ?)', 
            [username, email, hash, new Date()],
            (err, result)=>{
                if (err) throw err;
                console.log(result.insertId)
            })
    })
    

    res.send('signedupdd')
})
module.exports = router;