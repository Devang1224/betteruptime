const { createClient } = require("redis");
const prisma = require("../server/db");

async function main() {
  console.log("running the producer............");

  const client = await createClient()
    .on("error", (err) => console.log("redis client error", err))
    .connect();

  const websites = await prisma.Website.findMany();

  console.log("pushing websites to the stream...................");
   console.log("websites length",websites.length)
  for (const site of websites) {
    const res = await client.xAdd("betteruptime:website", "*", {
      url: site.url,
      id: site.id,
    });
    console.log(`Pushed site ${site.url} → Redis ID: ${res}`);
  }

  console.log("--------pushed all the sites to redis stream");

  //     const res1 = await client.xAdd(
  //         'betteruptime:website','*',{
  //             url:"https://google.com",
  //             id: Date.now().toString(),
  //         }
  //     )

  //     console.log(res1)

  //    const readRes1 = await client.xRead({
  //     key:'betteruptime:website',
  //     id:'1753355744141-0'
  //    },{
  //     count:10,
  //     block:300
  //    })
  //     console.log(readRes1)

   await client.quit();
}

setInterval(() => main(),  10 * 1000); 
