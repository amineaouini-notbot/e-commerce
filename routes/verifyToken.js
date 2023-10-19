const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next)=>{

    const {token} = req.session
    if (!token) res.redirect('/user/signup')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_PASS)
        req.user = verified
    } catch (err) {
        res.redirect('/user/signup')
    }
}

module.exports = verifyToken