console.log("File UserModel is connected here!");

const mongoose = require( 'mongoose' ); 
const AutoIncrement = require('mongoose-sequence')(mongoose);


const UserSchema = new mongoose.Schema({
    first_name : {
        type : String,
        required : true,
        
    },
    last_name : {
        type : String,
        required : true,
        
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    users_bday : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true,
        
    }
    
});

UserSchema.plugin(AutoIncrement, {inc_field: 'users_id'});

const User = mongoose.model( 'users', UserSchema );

const UserModel = {
    createUser : function( newUser ){
        return User.create( newUser );
    },
    getUsers : function(){
        return User.find();
    },
    getUserById : function( userName ){
        return User.findOne({ userName });
    },
    getUserByEmail : function( userName ){
        return User.find({ email : userName });
    },
    
};

module.exports = {UserModel};

