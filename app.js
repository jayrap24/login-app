const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/loginapp');

const db = mongoose.connection;

const routes = require('./routes/index');
const users = require('./routes/users');

// initialize app
const app = express();

//View engine
app.set('views', path.join(__dirname,'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

//BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
    secret: 'secret',
    saveUinitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//express validator (get it from github)
app.use(expressValidator({
    errorFormatter:function(param, msg, value){
        const namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
    
    while(namespace.length){
        formParam += '[' + namspace.shift() + ']';
    }
    return {
        param: formParam,
        msg : msg,
        value : value
    };
} 
}));

//connect flash middleware
app.use(flash());

//Global Vars
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});
//Routes middleware
app.use('/', routes);
app.use('/users', users)

//Set port
app.set('port', (process.env.PORT || 9000));

app.listen(app.get('port'), function(){
    console.log('server is starting for the login app on port 9000')
});



