const { createClient } = require("redis");
const prisma = require("../server/db");
const axios = require('axios');

// client.xGroupCreate('betteruptime:website','india','$')

// client.xReadGroup('india',
//     'india-1',{
//      key:"betteruptime:website",
//      id:'>',
//     },{
//         "COUNT":1
//     }
//     )

async function main() {
  const client = await createClient()
    .on("error", (err) => console.log("redis client worker error", err))
    .connect();

  // const groupIndia = await client.xGroupCreate("betteruptime:website","india",'$');
  // const groupUsa = await client.xGroupCreate("betteruptime:website","usa",'$');

  // console.log("groupUsa",groupUsa);
  // console.log("groupIndia",groupIndia);

  console.log("worker is started");

  while (1) {
    console.log("Reading from the stream.................");
    const res = await client.xReadGroup(
      "india",
      "india-1",
      {
        key: "betteruptime:website",
        id: ">",
      },
      {
        COUNT: 2,
        BLOCK: 5000,
      }
    );
    if (!res) {
      console.log("No new messages. Waiting...");
      continue;
    }

    console.log("updating all the site.................");

    const webistesToTrack = res[0]?.messages;

    if (!webistesToTrack || webistesToTrack.length === 0) {
      console.log("No messages in response. Skipping update...");
      continue;
    }

    webistesToTrack.forEach(async (website) => {
         
      let startTime = Date.now();
      await axios
        .get(website.message?.url)
        .then(async() => {
           const response = await prisma.WebsiteTick.create({
            data: {
              status: "Up",
              response_time_ms: Date.now() - startTime,
              region_id: "936a2359-4672-45aa-9f22-be320c6e36f5",
              website_id: website.message?.id,
            },
          });
          console.log("PUSHED TO DB");
        })
        .catch((err) => {
          console.log("website url error", website);
          console.log("xxxxxxxxxxxx error with url xxxxxxxxxxxx", err);
          
        });
    });

    console.log("----------all sites are updated");
  }
}
main();
