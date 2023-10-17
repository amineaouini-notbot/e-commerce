const router = require('express').Router()
const bcrypt = require('bcrypt')

router.get('/signup', (req, res)=>{
    res.render('signup', {username: '', emai: '', password: ''})
})

router.post('/signup', (req, res)=>{
    console.log(req.body, 'test')
    bcrypt.hash(req.body.password, 10, (err, hash)=>{
        if (err) throw err;

        let newClient = {
            username: req.body.username,
            emai: req.body.emai,
            password: hash
        }
        console.log(newClient)
    })
    

    res.send('signedupdd')
})
module.exports = router;