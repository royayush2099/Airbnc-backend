const express =require('express');
const cors = require('cors')
const mongoose= require('mongoose')
require('dotenv').config()
const app = express();
app.use(express.json());// it is used to parse the json res object as we need to destrucuture the req body from frontend
app.use(cors({
    credentials:true,
    origin: 'http://localhost:5173',
}));
console.log(process.env.MONGO_URL)
mongoose.connect(process.env.MONGO_URL)

const Port = 8000;
app.get('/test',(req,res)=>{
res.json('test ok')
});

app.post('/register',(req,res)=>{
    const {name,email,password} = req.body;
    res.json({name,email,password});
})

app.listen(Port)