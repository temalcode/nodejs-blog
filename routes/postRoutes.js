//express
const express = require('express');
const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({extended: true}));
router.use(express.static('public'));
//model
const postModel = require('../models/postModel');
//auth0
const { requiresAuth } = require('express-openid-connect');
//method override
const methodOverride = require('method-override')
router.use(methodOverride('_method'))
//dompurify
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);


router.get('/:id', async function(req, res){
    try{
        let userProfile = req.oidc.user
        let isAuthenticated = req.oidc.isAuthenticated()
        let post = await postModel.findById(req.params.id);
        res.render('post', {post, isAuthenticated, userProfile});
    }catch(err){
        res.status(400).send(err.message);
    }
});

router.post('/create', requiresAuth(),  async function(req, res){
    try{
        let newPost = new postModel({
            title:  DOMPurify.sanitize(req.body.title),
            content:  DOMPurify.sanitize(req.body.content),
            author: req.oidc.user.sub,
            authorName: req.oidc.user.nickname
        });
        await newPost.save();
        res.redirect('/profile');
    }catch(err){
        res.status(500).send(err.message);
    }
})

router.put('/update/:id', requiresAuth(), async function(req, res){
    try{
        let post = await postModel.findById(req.params.id)
        if(post.author !== req.oidc.user.sub)
            return res.status(400).send('You can only update your posts')

        await postModel.findByIdAndUpdate(req.params.id, 
            {
                title: DOMPurify.sanitize(req.body.title),
                content: DOMPurify.sanitize(req.body.content)
            },
            {
                runValidators: true
            }
        );
        res.redirect('/profile')
    }catch(err){
        res.status(500).send(err.message);
    }
});

router.delete('/delete/:id', requiresAuth(), async function(req, res){
    try{
        let deletedPost = await postModel.findOneAndDelete({_id: req.params.id, author:req.oidc.user.sub});
        if(deletedPost == null){
            res.status(400).send('you do not have permission to delete this post');
        } else{
            res.status(200).redirect('/profile'); 
        }
        
    }catch(err){
        res.status(400).send(err.message);
    }
});


module.exports = router;