const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')
const fs = require('fs')
const { route } = require('./admin')

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
                if (err) {res.redirect('/signup')}
                else {

                    // console.log(result.insertId)
                    let privateKey = process.env.TOKEN_PASS;
                    let token = jwt.sign({ _id: result.insertId }, privateKey);
                    req.session.token = token
                    res.redirect(`/user`)
                }
            })
    }) 

})

router.get('/login', (req, res)=>{
    if (req.session.token) {res.redirect('/user')}
    else {res.render('login')}

})

router.post('/login', (req, res)=>{
    db.query("SELECT * FROM client WHERE email = ?", req.body.email, function (err, result) {
        if (err) {
            res.send("couldn't login!");
            return
        } else if(!result[0]){
            res.redirect('/user/login')
            return
        } else {

            console.log(result[0]);
            
            let privateKey = process.env.TOKEN_PASS;
            let token = jwt.sign({ _id: result[0].id }, privateKey);
            req.session.token = token
            res.redirect(`/user`)
        }
      });

})

router.get('/', verifyToken, (req, res)=>{
    if( !req.session.categories && !req.session.products){
        db.query('SELECT * from category', (err, result)=>{
            if (err) {res.send('problem accured!')}
            else {
                // console.log(result)
                req.session.categories = result;
                db.query('SELECT * from product', (err, result)=>{
                    if (err) {res.send('problem accured!')}
                    else {
                        if(!!result[0]){
                        for(let i in result){
                            const fileList = fs.readdirSync(__dirname+'/../public/upload/' + result[i].id)
                            result[i].images = fileList; 
                            
                        }}
                        req.session.products = result;
                        res.render('userHome', {categories: req.session.categories, products: result})
                    }
                })
                
            }
        })
    
    } else {
        let {categories, products} = req.session              
        res.render('userHome', {categories, products })

    }
})

router.get("/byCateg/:id", verifyToken, (req, res)=>{
    if(!req.session.categories && !req.session.products) res.redirect('/user')
    else{
        let {id} = req.params;
        let {categories, products} = req.session
        let byCateg = []

        for(let i in products){
            if(parseInt(products[i].category_id) === parseInt(id)) byCateg.push(products[i])
        }
        res.render('byCateg', {categories, products: byCateg});
    }
})
module.exports = router;