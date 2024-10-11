const express =require('express');
const cors = require('cors')
const mongoose= require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./models/User.js')
const imageDownloader = require('image-downloader')//used to download on local system when it is provided with link 
const multer = require('multer');//used to upload data from device 
const fs = require('fs')
require('dotenv').config()
const app = express();
//so we use gensaltsync because it is asunc function and it is giving error at first when used gensalt instead of current one 
const bcryptSalt= bcrypt.genSaltSync(10)// this is the second parameter in hashsync function
const jwtSecret = '333$35$20999ayushroy2003'
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.json());// it is used to parse the json res object as we need to destrucuture the req body from frontend
app.use('/uploads',express.static(__dirname+'/uploads'))
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


//api to handle logout 

app.post('/logout',(req,res)=>{
    res.cookie('token','').json(true);
})

app.post('/upload-by-link',async (req,res)=>{
const {link} = req.body;
const newName ='photo'+ Date.now() + '.jpg'; //giving new names to upladed image
await imageDownloader.image({
    url:link,
    dest: __dirname+'/uploads/'+newName,
});
res.json(newName)

})
const photosMidlleware = multer({dest:'uploads/'})//middleware for image upload

//api endpoint to add photos from device
app.post('/upload', photosMidlleware.array('photos',100),(req,res)=>{//name is photos because we are sending name photos from client side
const uploadedFiles = [];
    for(let i=0; i<req.files.length;i++){
    const {path,originalname} = req.files[i];//getting the path and originalname of file uploaded by device from req object 
  const parts =  originalname.split('.');//we are splitting originalname here with using dot as separator so to get the extension
  const ext = parts[parts.length - 1] ;
  const newPath = path + '.' + ext;
    fs.renameSync(path,newPath)//we are renaming use fs module on server side files
    uploadedFiles.push(newPath.replace(__dirname + '/uploads/', ''));

}
    res.json(uploadedFiles);
})

app.listen(Port)