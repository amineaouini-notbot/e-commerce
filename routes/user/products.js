const router = require('express').Router()
const verifyToken = require('../verifyToken')

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

module.exports = router