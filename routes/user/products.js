const router = require('express').Router()
const db = require('../../db/db');
const verifyToken = require('../verifyToken')
const fs = require('fs')

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

router.get('/:id', verifyToken, (req, res)=>{
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
                    res.render('product', {product})
                }
            }
        })
    }
    
})
module.exports = router