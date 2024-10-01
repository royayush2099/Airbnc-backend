const express =require('express');
const app = express();
const Port = 8000;
app.get('/test',(req,res)=>{
res.json('test ok')
});

app.listen(Port)