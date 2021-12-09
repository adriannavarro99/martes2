
const express = require( 'express' );
const mongoose = require( 'mongoose' );
const bcrypt = require( 'bcrypt' ); 
const session = require( 'express-session' );
const flash = require( 'express-flash' ); 
const { UserModel } = require('./models/UserModel');
const { isValid } = require('ipaddr.js');
const app = express();

mongoose.connect('mongodb://localhost/login', {useNewUrlParser: true}); 
app.set( 'views', __dirname + '/views' ); 
app.set( 'view engine', 'ejs' ); 

app.use( flash() ); 
app.use( express.urlencoded({extended:true}) ); // ????




app.get( '/', function( request, response ){ 
    response.redirect( '/login' );
});

app.get( '/login', function(req, res) { 
    res.render( 'login' );
});



app.post( '/register/user', function( request, response ){
    const first_name = request.body.first_name;
    const last_name = request.body.last_name;
    const email = request.body.email;
    const users_password = request.body.users_password;
    const users_bday = request.body.users_bday;

    let isValid = true;

    if(first_name === '' || last_name === '' || email === '' || users_password === '' || users_bday === ""){
        request.flash('registerBlank', "There is an empty space");
        isValid = false;
    }
    if(first_name.length < 3){
        request.flash( 'firstName', 'The firstname field must be at least 3 characters' );
        isValid = false;
    }
    if(last_name.length < 3){
        request.flash( 'lastName', 'The lastname field must be at least 3 characters' );
        isValid = false;
    }
    if(!validateEmail(email)){
        request.flash( 'email', 'The email field must have valid characters' );
        isValid = false;
    }
    

    if(isValid){
        bcrypt.hash( users_password, 10 )
            .then( encryptedPassword => {
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    password : encryptedPassword,
                    users_bday
                };
                

                UserModel
                    .createUser( newUser )
                    .then( result => {
                
                        request.flash( 'registration', 'A new user has been created successfully!' );
                        response.redirect( '/login' );
                    })
                    .catch( err => {
                        request.flash( 'registration', 'That email is already in use!' );
                        response.redirect( '/login' );
                    });
            });
    }
    else{
        response.redirect( '/login' );
    }
});



app.post( '/login/user', function( request, response ){
    let userName = request.body.loginEmail;
    console.log( "Result: ", userName );
    let password = request.body.loginUsers_password;

    let isValid = true;

    if(userName === '' || password === '' ){
        request.flash('loginBlank', "There is an empty space");
        isValid = false;
    }
    if(userName === '' ){
        request.flash('emailBlank', "There is an empty space");
        isValid = false;
    }
    
    if(isValid){
        UserModel
            .getUserByEmail( userName )
            .then( result => {
            
                if( result === null ){
                    throw new Error( "That user doesn't exist!" );
                }

                bcrypt.compare( password, result[0].password )
                    .then( flag => {
                        if( !flag ){
                            throw new Error( "Wrong credentials!" );
                        }
                        request.session.first_name = result[0].first_name;
                        request.session.last_name = result[0].last_name;
                        request.session.email = result[0].email;
                        request.session.users_bday = result[0].users_bday;
                        request.session.users_id = result[0].users_id;
                        response.redirect( '/home' );
                    })
                    .catch( error => {
                        request.flash( 'login', error.message );
                        response.redirect( '/' );
                    }); 
            })
            .catch( error => {
                request.flash( 'login', error.message );
                response.redirect( '/' );
            });
    }
    else{
        response.redirect( '/' );
    }

    
});



app.get( '/home', function( request, response ){ 
    if( request.session.email === undefined ){
        response.redirect( '/' );
    }
    else{
        UserModel
            .getUsers()
            .then( data => {
                console.log( data );
                let currentUser = {
                    first_name : request.session.first_name,
                    last_name : request.session.last_name,
                    email : request.session.email,
                    users_bday : request.session.users_bday,
                    users_id : request.session.users_id
                }
                response.render( 'home', { users : currentUser } );
            }); 
    }
});








app.listen( 8080, function(){
    console.log( "The users server is running in port 8080." );
});