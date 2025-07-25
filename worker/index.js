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
  // return;

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

    const webistesToTrack = res?.[0]?.messages;

    if (!webistesToTrack || webistesToTrack.length === 0) {
      console.log("No messages in response. Skipping update...");
      continue;
    }

  let promises =  webistesToTrack?.map((website) => {
         return fetchWebsite(website,client);
    })
    await Promise.all(promises);
    console.log("PUSHED TO DB");

   
/// acknowledging /////////

   console.log("acknowledging........ ");
   const ids = webistesToTrack?.map(({id})=>id) ?? [];
  const ackPromises = xAckBulk('india',ids,client);
  await Promise.all(ackPromises);

  console.log("acknowledged---------- ");


    console.log("----------all sites are updated");
  }
}

async function fetchWebsite(website,client){

        let startTime = Date.now();
         await axios
        .get(website.message?.url)
        .then(async() => {
          const response = await prisma.WebsiteTick.create({
            data: {
              status: "Up",
              response_time_ms: Date.now() - startTime,
              region_id: "8def9d5b-f72e-4759-bdf8-b2546cd74567",
              website_id: website.message?.id,
            },
          });
        })
        .catch(async (err) => {
          // console.log("website url error", website);
          // console.log("xxxxxxxxxxxx error with url xxxxxxxxxxxx", err);
          const response = await prisma.WebsiteTick.create({
            data: {
              status: "Down",
              response_time_ms: Date.now() - startTime,
              region_id: "8def9d5b-f72e-4759-bdf8-b2546cd74567",
              website_id: website.message?.id,
            },
          });
        });

        // this function will return a promise by default as it is an async function
}
 
function xAckBulk(consumerGroup,eventIds,client){
  return eventIds?.map((eventId)=>client.xAck('betteruptime:website',consumerGroup,eventId));
}

main();
