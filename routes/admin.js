const router = require('express').Router();
const db = require('../db/db')
const jwt = require("jsonwebtoken")

router.get('/', (req, res)=>{
    if (!req.session.adminLogged) {res.redirect('/admin/login')}
    else res.send('logged as admin')
})


router.get('/login', (req, res)=>{
    if (req.session.adminLogged) {res.redirect('/admin')}
    else res.render('adminLogin')
})

router.post('/login', (req, res)=>{
    let {username, password} = req.body
    db.query('SELECT id FROM admin WHERE username = (?) AND password = md5(?)',
        [username, password],
        (err, result) =>{
            console.log(result)
            if ( err || !result[0] ) { res.send(`You can't login as Admin!`)}
            else {

                let privateKey = process.env.TOKEN_PASS;
                let token = jwt.sign({ _id: result[0].id }, privateKey);
                req.session.adminLogged = token
                res.redirect('/admin')
            }
        } 
    )
})
module.exports = router