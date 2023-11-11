const express = require('express')
const app = express();
const db = require('./db/db')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const productsRouter = require('./routes/products');
const session = require('express-session')
const fileUpload = require('express-fileupload') 
const methodOverride = require('method-override');
const fs = require('fs')
const path = require('path')
require('dotenv').config()

app.use(fileUpload())
app.use(express.urlencoded({ extended: false}))
app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname +'/public/views')
app.set('view engine', 'ejs')
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}))

app.get('/', (req, res)=>{
    if (!!req.session.token) res.redirect('/user')
    else {
        if( !req.session.categories && !req.session.products){
            db.query('SELECT * from category', (err, result)=>{
                if (err) {res.send('problem accured!')}
                else {
                    req.session.categories = result;
                    db.query('SELECT * from product', (err, result)=>{
                        if (err) {res.send('problem accured!')}
                        else {
                            if(!!result[0]){
                            for(let i in result){ 
                                const fileList = fs.readdirSync(path.join(__dirname, 'public', 'upload', result[i].id.toString()))
                                result[i].images = fileList; 
                                
                            }}
                            req.session.products = result;
                            res.render('Home', {categories: req.session.categories, products: result, cart: {id: 0}})
                        }
                    })
                    
                }
            })
        
        } else {
            let {categories, products} = req.session      
            
            res.render('Home', {categories, products, cart: {id: 0}})
        }
    }
})

app.use('/user', userRouter)
app.use('/admin', adminRouter)
app.use('/products' , productsRouter) 

const PORT = 5000
app.listen(PORT, ()=>{
    console.log('server works on port 5000!')
})