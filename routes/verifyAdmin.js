const jwt = require('jsonwebtoken')

const verifyAdmin = async(req, res, next) =>{
    if (!req.session.adminLogged) {res.redirect('/admin/login')}
    else {
        try{

            let privateKey = process.env.ADMIN_TOKEN_PASS;
            let token = req.session.adminLogged;
            jwt.verify(token, privateKey)
            
        } catch(err) { res.redirect('/admin/login') }
        next()
    }
}

module.exports =  verifyAdmin;