const router = require('express').Router();
const session = require('express-session');
const db = require('../db/db')
const jwt = require("jsonwebtoken");
const verifyAdmin = require('./verifyAdmin');
const fs = require('fs');

router.get('/', verifyAdmin, (req, res)=>{
    if( !req.session.categories){
        db.query('SELECT * from category', (err, result)=>{
            if (err) {res.send('problem accured!')}
            else {
                // console.log(result)
                req.session.categories = result;
                
                res.render('adminHome', {categories: result})
            }
        })
    
    } else {
        let {categories} = req.session              
        res.render('adminHome', {categories})

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
            if ( err || !result[0] ) { res.send(`You can't login as Admin!`)}
            else {

                let privateKey = process.env.ADMIN_TOKEN_PASS;
                let token = jwt.sign({ _id: result[0].id }, privateKey);
                req.session.adminLogged = token
                res.redirect('/admin')
            }
        } 
    )
})

router.post('/addCateg', verifyAdmin, (req, res)=>{
    let {title} = req.body
    if (!req.session.adminLogged) {res.redirect('/admin/login')}
        else {
        db.query("INSERT INTO category (title) VALUES (?)", [title], (err, result)=>{
            if (err) {res.send("couldn't add category")}
            else {
                let id = result.insertId
                if(req.session.categories[0]) {
                    req.session.categories.push({id, title}) 
                } else req.session.categories = [{id, title}]

                res.redirect('/admin') 
            }
        })
    }
})

router.get('/addProd', verifyAdmin, (req, res)=>{
    let {categories} = req.session
    res.render('addProd', {categories})
})

router.post('/addProd', verifyAdmin, (req, res)=>{
    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }
    let {image} = req.files;
    console.log(parseInt(req.body.category), 'qsdfd')
    let {title, category, price, description} = req.body
    // res.redirect('/admin/addProd')
    db.query('INSERT INTO product (title, category_id, price, description, created_at) VALUES (?, ?, ?, ?, ?)',
    [title, parseInt(category), parseInt(price), description, new Date()], (err, result) =>{
        if(err) {throw err}
        else {
                if (!fs.existsSync(`${__dirname}/../public/upload`)){
                    fs.mkdirSync(`${__dirname}/../public/upload/`)
                }
                fs.mkdir(`${__dirname}/../public/upload/${result.insertId}`, err =>{
                    if (err) throw err
                    else{

                        image.mv(`${__dirname}/../public/upload/${result.insertId}/${image.name}`);
                        // res.render('test', {id: insertId, image: image.name})
                        res.redirect('/admin')
                    }
                });
               
            }
        })
})
module.exports = router