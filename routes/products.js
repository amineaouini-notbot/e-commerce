const router = require('express').Router()
const db = require('../db/db');
const verifyToken = require('./verifyToken')
const fs = require('fs')

router.get("/byCateg/:id", (req, res)=>{ // checked
    let cart = !!req.session.cart ? req.session.cart : {id: 0} 
     
    if(!req.session.categories && !req.session.products) res.redirect('/user')
    else{
        let {id} = req.params;
        let {categories, products} = req.session
        let byCateg = []

        for(let i in products){
            if(parseInt(products[i].category_id) === parseInt(id)) byCateg.push(products[i])
        }
        res.render('byCateg', {categories, products: byCateg, cart});
    }
})

router.get('/:id', (req, res)=>{ // checked
    let {cart} = req.session
    if(!req.session.categories && !req.session.products) res.redirect('/user')
    else {
        let {id} = req.params
        db.query('SELECT * FROM product WHERE id = ?', [id], (err, result)=>{
            if(err) res.send('problem accured in db')
            else{
                if(result[0]){
                    let product = result[0]
                    const imagesList = fs.readdirSync(__dirname+'/../public/upload/' + id)
                    product.images = imagesList
                    res.render('product', {product, cart})
                }
            }
        })
    }
    
})

router.post('/addtoCart', verifyToken, (req, res)=>{ // checked
    let {product_id, cart_id} = req.body
    db.query('INSERT INTO cart_items (cart_id, product_id, created_at) VALUES (?, ?, ?)', [cart_id, product_id, new Date()],
    (err, result)=>{
        if(err) res.send("couldn't add products into cart!!")
        else {
            console.log('product added into cart!')
            res.redirect('/user')
        }
    })
})

router.delete('/removeFromCart/:id', verifyToken, (req, res)=>{ // checked
    let {id} = req.params;
    db.query("DELETE FROM cart_items WHERE id = (?)", [id], (err, result)=>{
        if(err) res.send("couldn't delete cart item!!")
        else {
            res.redirect('/user/checkout')
        }
    })
})

router.post('/newCart', verifyToken, (req, res)=>{ // checked
    let {_id} = req.user
    db.query('INSERT INTO cart (client_id, created_at) VALUES (?, ?)',
        [_id, new Date()], (err, result)=>{
            if(err) res.send("couldn't create new cart!!")
            else {
                req.session.cart = {id: result.insertId, state: ''}
                res.redirect(`/user`)
            }
        })

})

router.put('/checkedout', verifyToken, (req, res)=>{ // checked
    let cart_id = req.session.cart.id
    db.query("UPDATE cart set state = 'checked_out' WHERE id = (?)", [cart_id],
                (err, result)=>{
                    if(err) res.send("couldn't update cart state")
                    req.session.cart.state = 'checked_out'
                    res.status(200).send("cart state is updated")
                })
})
module.exports = router