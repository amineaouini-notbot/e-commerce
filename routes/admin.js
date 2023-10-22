const router = require('express').Router();
const session = require('express-session');
const db = require('../db/db')
const jwt = require("jsonwebtoken")

router.get('/', (req, res)=>{
    if (!req.session.adminLogged) {res.redirect('/admin/login')}
    else {
        db.query('SELECT * from category', (err, result)=>{
            if (err) {res.send('problem accured!')}
            else {
                // console.log(result)
                req.session.categories = result;
                
                res.render('adminHome', {categories: result})
            }
        })
    
    }
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

router.post('/addCateg', (req, res)=>{
    let {title} = req.body
    if (!req.session.adminLogged) {res.redirect('/admin/login')}
        else {
        db.query("INSERT INTO category (title) VALUES (?)", [title], (err, result)=>{
            if (err) {res.send("couldn't add category")}
            else {
                if(req.session.categories[0]) {
                    let id = result.insertId
                    req.session.categories.push({id, title}) 
                } else req.session.categories = [{id, title}]

                res.redirect('/admin') 
            }
        })
    }
})
module.exports = router