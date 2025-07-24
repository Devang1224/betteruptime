const {createClient} = require("redis");



async function main (){

    
    const client = await createClient().on("error",(err)=>console.log("redis client error",err)).connect();
    

    
    const res1 = await client.xAdd(
        'betteruptime:website','*',{
            url:"https://google.com",
            id: Date.now().toString(),
        }
    )
    
    console.log(res1)

   const readRes1 = await client.xRead({
    key:'betteruptime:website',
    id:'1753355744141-0'
   },{
    count:10,
    block:300
   })
    console.log(readRes1)

   client.destroy();


}

main();