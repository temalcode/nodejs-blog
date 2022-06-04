//express
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(express.static('public'));
//auth0
const { requiresAuth } = require('express-openid-connect');
//model
const postModel = require('../models/postModel')

router.get('/newpost', requiresAuth(), (req, res) => {
    res.render('newPost')
})

router.get('/updatepost/:id', requiresAuth(), async (req, res) => {
    try{        
        let post = await postModel.findById(req.params.id)
        if(post.author !== req.oidc.user.sub)
            return res.status(400).send('You can only update your posts')

        res.render('updatePost', {post})
    } catch(err){
        res.status(500).send(err.message)
    }
})

module.exports = router