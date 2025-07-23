const axios = require("axios")


let base_url= "http://localhost:3000"

function getUserName(){
  return `tester${Math.floor(Math.random()*100000)}`
}
 
 let USERNAME = getUserName();


describe("website gets created",()=>{

   let user;

   beforeAll(async()=>{
       try{
           let NEW_USER = getUserName();
           const res = await axios.post(`${base_url}/user/signup`,{username:NEW_USER,password:"password"});
            user = res.data?.data?.id;
       }catch(err){
            console.log("error while creating a new user",err);
       }
   })

    test("website not created if url is not present",async()=>{
    
        try{
            const res = await axios.post(`${base_url}/website`)
            // expect(false);
            throw new Error("Website created when it shouldn't have been");
        }catch(err){
        //    expect(err.response?.status || 0).toBeGreaterThanOrEqual(400);
          expect(err.response?.status).toBe(411); 
          expect(err.response?.data?.message).toBe("need url");
        }
    })

      test("website created if url is present",async()=>{
    
            const res = await axios.post(`${base_url}/website`,{url:"https://google.com",userId:user});
            expect(res.data.id).not.toBeNull();
             
    })
}) 

describe("user signup", ()=>{
  test("user's req body is incorrect",async()=>{
       try{
             const res = await axios.post(`${base_url}/user/signup`);
            fail("control should not reach here")
       }catch(err){
        //  console.log("",err)
          expect(err?.status).toBe(403); 
       }
  })

    test("user created successfully",async()=>{
             const res = await axios.post(`${base_url}/user/signup`,{username:USERNAME,password:"password"});
            //  console.log("signup data",res)
             expect(res?.status).toBe(200);
             expect(res.data?.data?.id).toBeDefined();
  })

})



describe("user login", ()=>{
  test("user's req body is incorrect",async()=>{
       try{
             const res = await axios.post(`${base_url}/user/login`);
             
             throw new Error("Control should not reach here");
            }catch(err){
              
        expect(err.response?.status).toBe(403);

       }
  })

  test("user is able to login",async()=>{
             const res = await axios.post(`${base_url}/user/login`,{username:USERNAME,password:"password"});
             expect(res?.status).toBe(200);
             expect(res.data?.data?.id).toBeDefined();
  })

})