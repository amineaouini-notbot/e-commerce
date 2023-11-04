const router = require('express').Router()
const bcrypt = require('bcrypt')
const db = require('../db/db')
const jwt = require('jsonwebtoken')
const verifyToken = require('./verifyToken')
const fs = require('fs')
const paypal = require('@paypal/checkout-server-sdk')

require('dotenv').config()

const env = process.env.NODE_ENV
const Environment = env === 'production' 
? paypal.core.LiveEnvironment
: paypal.core.SandboxEnvironment
const paypalClient = new paypal.core.PayPalHttpClient(
    new Environment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
    )
)

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
                            req.session.cart = {id: result.insertId}
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


router.get('/checkout', verifyToken, (req, res)=>{
    let {cart } = req.session
    db.query(`SELECT cart_items.id, product.id AS product_id, product.title, product.price 
            FROM cart_items LEFT JOIN product
            ON cart_items.product_id = product.id WHERE cart_items.cart_id = (?)`, [cart.id],
            (err, result)=>{
                if(err) res.send("couldn't retreive cart items!!")
                else{
                    if(!!result[0]){
                        let total = 0;
                        let items = result;
                        for(let i in items){
                            const imagesList = fs.readdirSync(__dirname+'/../public/upload/' + items[i].product_id)
                            items[i].image = imagesList[0];
                            total += items[i].price
                        }

                        res.render('checkout', {items, total, paypalClientId: process.env.PAYPAL_CLIENT_ID})
                    } else res.redirect('/user')
                }
            })
})

router.post('/checkout', verifyToken, async (req, res)=>{
    let cart_id = req.session.cart.id
    db.query(`SELECT cart_items.id AS item_id, product.id, product.title, product.price 
    FROM cart_items LEFT JOIN product
    ON cart_items.product_id = product.id WHERE cart_items.cart_id = (?)`, [cart_id],
    async (err, result)=>{
        if(err) res.send("error accured at checkout!!")
        else {
            const request = new paypal.orders.OrdersCreateRequest()
            let total = result.reduce((sum, item)=>sum + item.price, 0)
            
            // console.log(total, items)
            request.prefer("return=representation")
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: total,
                            breakdown: {
                                item_total: {
                                    value: total,
                                    currency_code: 'USD'
                                }
                            }                    
                        
                        },
                        items: result.map(item => {
                            return {
                                name: item.title,
                                unit_amount: {
                                    currency_code: 'USD',
                                    value: item.price
                                },
                                quantity: 1
                            }
                        })
                    }
                ]
            })
            try {
                const order = await paypalClient.execute(request)
                res.json({id: order.result.id})
            } catch(err) {
                res.status(500).json({error: err.message});
            }
            }
        })
})

router.use('/products' , require('./user/products')) 

module.exports = router;