const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')

router.get('/signup', (req, res)=>{
    if (req.session.token) res.redirect('/user');
    res.render('signup', {username: '', emai: '', password: ''})
})

router.post('/signup', (req, res)=>{
    if (req.session.token) res.redirect('/')
    bcrypt.hash(req.body.password, 10, (err, hash)=>{
        if (err) throw err;
        
        const {username, email} = req.body;
        db.query('INSERT INTO client (username, email, password, created_at) VALUES (?, ?, ?, ?)', 
            [username, email, hash, new Date()],
            (err, result)=>{
                if (err) throw err;
                // console.log(result.insertId)
                let privateKey = process.env.TOKEN_PASS;
                let token = jwt.sign({ _id: result.insertId }, privateKey);
                req.session.token = token
                res.redirect(`/user`)
            })
    }) 

})

router.get('/login', (req, res)=>{
    if (req.session.token) res.redirect('/user');

    res.render('login')
})

router.post('/login', (req, res)=>{
    db.query("SELECT * FROM client WHERE email = ?", req.body.email, function (err, result) {
        if (err) throw err;
        console.log(result[0]);
        let privateKey = process.env.TOKEN_PASS;
                let token = jwt.sign({ _id: result[0].id }, privateKey);
                req.session.token = token
                res.redirect(`/user`)
      });

})

router.get('/', (req, res)=>{
    let { token } = req.session
    res.send('logged in with ->' + token)
})
module.exports = router;