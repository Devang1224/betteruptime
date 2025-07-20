const axios = require("axios")


let base_url= "http://localhost:3000"

describe("website gets created",()=>{
    test("website not created if url is not paresent",async()=>{
    
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
    
            const res = await axios.post(`${base_url}/website`,{url:"https://google.com"})
            expect(res.data.id).not.toBeNull();
             
    })
}) 