const express = require('express');
const dotenv = require("dotenv");
const prisma = require("./db");
const UserSchema = require('./types');
const app = express();
app.use(express.json())

dotenv.config();


app.post("/website",async (req,res)=>{
    if(!req?.body?.url){
       return res.status(411).json({
            message:"need url"
        })
    }

  const website = await prisma.Website.create({
  data: {
    url: req.body.url,
    timeAdded: new Date(),
    user_id:req.body.userId
  }
})

   res.json({
    id:website.id
   })
})

// get website current status
app.get("/status/:websiteId",async (req,res)=>{

     try{
       
     if(!req.body.userId ){
      return res.status(411).json({message:"userid not present"});
     }

       const website= await prisma.website.findFirst({
         where:{
           user_id:req.body.userId,
           id:req.params.websiteId
          },
          include:{
            ticks:{
              orderBy:[{
                createdAt:'desc'
              }],
              take:1
            }
          }
        })
        if(!website){
          return res.status(409).json({message:"website not found"});
        }

        return res.status(200).json({
          message:"website's data fetched successfully",
          data:website,
          success:true
        })

     }catch(err){
         return res.status(500).json({message:"Something went wrong"});
      }
})

app.post("/user/signup",async(req,res)=>{
  try{
     const data = UserSchema.safeParse(req.body);

      if(!data.success){
          return res.status(403).json({message:"invalid req body",success:false});
      }
       
     const {username,password } = data?.data;


     const user = await prisma.User.create({
      data:{
        username:username,
        password:password
      }
     })

   if(user){
    return res.status(200).json({
      message:"user created successfully",
      data:user
    })
   }

 }catch(err){
  console.log("error signup",err)
  return res.status(500).json({
    message:"unable to signup at this moment"
  })
 }
})


app.post("/user/login",async(req,res)=>{
  try{
     const data = UserSchema.safeParse(req.body);
     if(!data.success){
          return res.status(403).json({message:"invalid req body",success:false});
     }
      


     const user = await prisma.User.findFirst({
      where:{
        username:data.data?.username
      }
     })
     if(!user){
       return res.status(400).json({message:'user not found',success:false});
      }
      console.log("logined user ",user,data?.data?.password);
      
      if(user.password!=data.data?.password){
        return res.status(403).json({message:"password is incorrect",success:false});
      }
      
     return res.status(200).json({message:"user logined successfully",success:true,data:user});


  }catch(err){
      return res.status(500).json({message:"cannot login at this moment",err:err});
  }
})


app.listen(process.env.PORT,()=>{
    console.log("server is started");
})