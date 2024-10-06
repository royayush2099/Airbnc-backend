const express =require('express');
const cors = require('cors')
const mongoose= require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/User.js')
require('dotenv').config()
const app = express();
//so we use gensaltsync because it is asunc function and it is giving error at first when used gensalt instead of current one 
const bcryptSalt= bcrypt.genSaltSync(10)// this is the second parameter in hashsync function
const jwtSecret = '333$35$20999ayushroy2003'
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());// it is used to parse the json res object as we need to destrucuture the req body from frontend
app.use(cors({
    credentials:true,
    origin: 'http://localhost:5173',
}));

mongoose.connect(process.env.MONGO_URL)

const Port = 8000;
app.get('/test',(req,res)=>{
res.json('test ok')
});

app.post('/register',async (req,res)=>{
    const {name,email,password} = req.body;
 try{ const userDoc =  await  User.create({
       name,
       email,
       password:bcrypt.hashSync(password, bcryptSalt ),//hashing the password using bcrypt 
    });
    res.json(userDoc);
} catch (e) {
    res.status(422).json(e);
}
}) //post route for login
app.post('/login',async (req,res)=>{
   const {email,password} = req.body; // getting from the body 
   const userDoc= await User.findOne({email});//this mongodb searching of email
   if(userDoc){//this userDoc is user object 
    const passOk = bcrypt.compareSync(password, userDoc.password);//comapring with hashed password
    if(passOk){//checking if password is ok
    jwt.sign({email:userDoc.email,
         id:userDoc._id,
         name:userDoc.name}
         ,jwtSecret,{},(err,token)=>{
        if(err) throw err;
        res.cookie('token',token).json(userDoc) // we are sending a cookie and creating json web token here
    })//jwt creation 
       
    } else{
        res.status(422).json('pass not ok')
    }
   }else{
    res.json('not found');
   }
})

//api to /profile for fetching user information in usercontext at login time
app.get('/profile',(req,res)=>{
    const {token}  = req.cookies;
    if(token){
jwt.verify(token, jwtSecret, {}, async (err,userData)=>{//here we passed userData and token have to learn this more
if(err) throw err;
 const {name,email,_id} = await User.findById(userData.id);//we are finding user from there id in profile routes
res.json({name,email,_id});
})
    }
    else{
        res.json(null)
    }
 
})

app.listen(Port)