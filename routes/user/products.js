const router = require('express').Router()
const db = require('../../db/db');
const verifyToken = require('../verifyToken')
const fs = require('fs')

router.get("/byCateg/:id", verifyToken, (req, res)=>{
    let {cart} = req.session
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

router.get('/:id', verifyToken, (req, res)=>{
    let {cart} = req.session
    if(!req.session.categories && !req.session.products) res.redirect('/user')
    else {
        let {id} = req.params
        db.query('SELECT * FROM product WHERE id = ?', [id], (err, result)=>{
            if(err) res.send('problem accured in db')
            else{
                if(result[0]){
                    let product = result[0]
                    const imagesList = fs.readdirSync(__dirname+'/../../public/upload/' + id)
                    product.images = imagesList
                    res.render('product', {product, cart})
                }
            }
        })
    }
    
})

router.post('/addtoCart', verifyToken, (req, res)=>{
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

router.delete('/removeFromCart/:id', verifyToken, (req, res)=>{
    let {id} = req.params;
    db.query("DELETE FROM cart_items WHERE id = (?)", [id], (err, result)=>{
        if(err) res.send("couldn't delete cart item!!")
        else {
            res.redirect('/user/checkout')
        }
    })
})

router.put('/checkedout', verifyToken, (req, res)=>{
    let cart_id = req.session.cart.id
    db.query("UPDATE cart set state = 'checked_out' WHERE id = (?)", [cart_id],
                (err, result)=>{
                    if(err) res.send("couldn't update cart state")
                    res.status(200).send("cart state is updated")
                })
})
module.exports = router