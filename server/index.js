const express = require('express');
const dotenv = require("dotenv");
const prisma = require("./db")
const app = express();
app.use(express.json())

dotenv.config();


app.post("/website",async (req,res)=>{
    if(!req?.body?.url){
       return res.status(411).json({
            message:"need url"
        })
    }

  const website = await prisma.website.create({
  data: {
    url: req.body.url,
    timeAdded: new Date()
  }
})

   res.json({
    id:website.id
   })
})

app.get("/status/:websiteId",(req,res)=>{
     
})


app.listen(process.env.PORT,()=>{
    console.log("server is started");
})