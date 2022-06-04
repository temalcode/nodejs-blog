const express = require('express')
const router = express.Router()
router.use(express.static('public'));
const postModel = require('../models/postModel');
const { requiresAuth } = require('express-openid-connect');

router.get('/profile', requiresAuth(), async (req, res) => {
    try{
        let userPosts = await postModel.find({author: req.oidc.user.sub});
        let userProfile = req.oidc.user
        res.render('profile', {userPosts, userProfile})
    } catch(err){
        res.status(500).send(err.message)
    }
});

module.exports = router