const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next)=>{

    const {token} = req.session
    if (!token) res.status(401).render('signup', {username: '', emai: '', password: ''})

    try {
        const verified = jwt.verify(token, process.env.TOKEN_PASS)
        req.user = verified
    } catch (err) {
        res.status(400).render('signup', {username: '', emai: '', password: ''})
    }
}