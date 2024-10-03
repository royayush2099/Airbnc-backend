const express =require('express');
const cors = require('cors')
const mongoose= require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User.js')
require('dotenv').config()
const app = express();
//so we use gensaltsync because it is asunc function and it is giving error at first when used gensalt instead of current one 
const bcryptSalt= bcrypt.genSaltSync(10)// this is the second parameter in hashsync function
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
})

app.listen(Port)