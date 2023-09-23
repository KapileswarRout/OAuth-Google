const express = require("express");
const passport = require("passport");
const session = require("express-session");
const app = express();
const path = require("path");
require("./auth");
const port = process.env.PORT || 5000;

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }))
app.use(passport.initialize());
app.use(passport.session());


app.use(express.json());
app.use(express.static(path.join(__dirname,"client")));

app.get('/', (req,res)=>{
    res.send("index.html");
})

app.listen(port, ()=>{
    console.log(`Listen at port ${port}`);
})

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware
    }
    res.redirect('/'); // User is not authenticated, redirect them to the home page or login page
    // req.user ? next() : res.sendStatus(401);
}

app.get('/auth/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/auth/google/failure'
}));

app.get("/auth/google/failure",  (req,res) =>{
    res.send("Something went wrong");
})

app.get("/auth/protected", isLoggedIn, (req,res) =>{
    if (req.user) {
        console.log('Authenticated user:', req.user);
        let name = req.user.displayName;
        res.send(`Hello ${name}`);
    } else {
        console.log('Authentication failed or user not available.');
        res.status(401).send('Unauthorized');
    }
})

app.get('/logout', (req, res) => {
    req.logout(); // This will clear the user's session
    res.redirect('/');
});
