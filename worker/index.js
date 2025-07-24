const {createClient} = require('redis');


const client = createClient.on((err)=>console.log('redis client worker error',err)).connect();

// client.xCreateGroup('betteruptime:website','india',$)
client.xReadGroup('india',
    'india-1',{
     key:"betteruptime:website",
     id:'>',
    },{
        "COUNT":1
    }
    )