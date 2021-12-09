var express = require('express');
var session = require('express-session');
var flash = require('express-flash');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/Message-Board');


var CommentSchema = new mongoose.Schema({
    name:{
        type:String,required:[true,'Name field must not be empty'],
        minlength:[3,"name must be 3 charcters or more"]},
    comment:{
        type:String,required:[true,'comment field must not be empty'],
        minlength:[3,],maxlength:[255]}
},{timestamps:true});
var MessageSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name field must not be empty'],
        minlength:[3,"name must be 3 characters or more"]},
    message:{
        type:String,
        required:[true,'message field must not be empty'],
        minlength:[3,"message must be more than 3 characters"],
        maxlength:[255,'message must be 255 characters or less']},
    comments:[CommentSchema]
});



var Comment = mongoose.model('Comment',CommentSchema);
var Message = mongoose.model('Message',MessageSchema);
var moment = require('moment');
app.listen(8080);

app.use(flash());
app.use(express.static(__dirname + '/static'));
app.use(session({
secret:'activeSession',
resave:false,
saveUninitialized:true,
cookie: {maxAge:60000}
}))
app.use(bodyParser.urlencoded({extended: true}));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
    Message.find({},function(err,allMsg){
        if(err){
            console.log('error finding all messages')
        }
        else{
            response.render('index',{
                postedMsgs:allMsg,
                moment:moment
            });
        }
    }).sort({createdAt:'desc'});
    
});

app.post('/message', function(request,response){
    var msgPost = new Message({
        name:request.body.msgName,
        message:request.body.msg
    });
    msgPost.save(function(err){
        if(err){
            for(var key in err.errors){
                request.flash('messageError',err.errors[key].message);
            }
            response.redirect('/');
        }
        else{
            response.redirect('/');
        }
    });
});

app.post('/comment/:id', function(request,response){
    Comment.create({name:request.body.cmtName, comment:request.body.cmt}, function(err,comment){
        if(err){
            for(var key in err.errors){
                request.flash('commentError',err.errors[key].message);
                
            }
            response.redirect('/');
        }
        else{
        Message.findOneAndUpdate({_id:request.params.id}, {$push:{comments:comment}},function(err,data){
            if(err){
                console.log("Error at finding query")
            }
            else{

            response.redirect('/');
            }
        });  
        }
    });
});