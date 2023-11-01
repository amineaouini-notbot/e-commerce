const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')
const fs = require('fs')

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
                    let client_id = result.insertId
                    db.query('INSERT INTO cart (client_id, created_at) VALUES (?, ?)',
                    [result.insertId, new Date()],
                    (err, result)=>{
                        if(err) {res.redirect('/signup')}
                        else{
                            let privateKey = process.env.TOKEN_PASS;
                            let token = jwt.sign({ _id: client_id }, privateKey);
                            req.session.token = token
                            req.session.cart_id = result.insertId
                            res.redirect(`/user`)
                        }

                    })
                    // console.log(result.insertId)
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
            let client = result[0]
            bcrypt.compare(req.body.password, client.password, function(err, result) {
                if(err) res.send("couldn't check password")
                else if(result){
                    db.query("SELECT id, created_at FROM cart WHERE client_id = (?)", [client.id], (err, result)=>{
                        if(err) res.send("couldn't retrieve carts")
                        else {
                            let privateKey = process.env.TOKEN_PASS;
                            let token = jwt.sign({ _id: client.id }, privateKey);
                            req.session.token = token
                            req.session.cart = result[result.length-1]; 
                            res.redirect('/user/')
                        }
                    })
                } else res.redirect('/user/signup')
            });
        }
      });

})

router.get('/', verifyToken, (req, res)=>{
    let {cart} = req.session
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
                        res.render('userHome', {categories: req.session.categories, products: result, cart})
                    }
                })
                
            }
        })
    
    } else {
        let {categories, products} = req.session              
        res.render('userHome', {categories, products, cart })

    }
})

router.use('/products' , require('./user/products')) 

module.exports = router;