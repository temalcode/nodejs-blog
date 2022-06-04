//express
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//rate-limit
const rateLimit = require('express-rate-limit');
const apiRequestLimiter = rateLimit({
    windowMs: 1000 * 60 * 60, 
	max: 300
})
app.use(apiRequestLimiter);
//dotenv
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
// mongoDB
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL, () => console.log('connected to the database'));
//model
const postModel = require('./models/postModel');
//Auth0
const { auth } = require('express-openid-connect');
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.secret,
  baseURL: process.env.baseURL,
  clientID: process.env.clientID,
  issuerBaseURL: process.env.issuerBaseURL
};
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));


app.get('/', async function(req, res) {
    try{
        let isAuthenticated = req.oidc.isAuthenticated()
        let userProfile = req.oidc.user
        let allPosts = await postModel.find().sort({dateOfCreated: '-1'});
        res.render('home', {isAuthenticated, allPosts, userProfile});
    }catch(err){
        res.status(500).send(err.message);
    }
});


//routes
const postRoutes = require('./routes/postRoutes');
app.use('/posts', postRoutes);
const pageRoutes = require('./routes/pageRoutes');
app.use('/', pageRoutes);
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);
//404
app.get("*", function(req, res){
    res.status(404).send('resource not found');
})
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server is running on port ${port}`));