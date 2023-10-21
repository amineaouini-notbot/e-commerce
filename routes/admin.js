const router = require('express').Router();

router.get('/', (req, res)=>{
    if (req.session.adminLogged) {res.redirect('/admin/login')}
    else res.send('logged as admin')
})


router.get('/login', (req, res)=>{
    if (req.session.adminLogged) {res.redirect('/admin')}
    else res.render('adminLogin')
})

module.exports = router