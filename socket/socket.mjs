import mongodb from 'mongodb'
import http from 'http';
import ws from 'websocket';
import redis from 'ioredis';
import { Worker } from 'snowflake-uuid';

const generator = new Worker(0, 1, {
    workerIdBits: 5,
    datacenterIdBits: 5,
    sequenceBits: 12,
});
const ID = process.env.ID
const WebSocketServer = ws.server
const httpserver = http.createServer()
const websocket = new WebSocketServer({
    "httpServer": httpserver
})
const mongo_server = typeof process.env.mongo_server == 'undefined' ? "localhost" : process.env.mongo_server
const db_uri = "mongodb://" + mongo_server + ":27017"
const db_client = new mongodb.MongoClient(db_uri)
db_client.connect();
const chat_messages = db_client.db('chat').collection('messages')

const sockets = []

const subsriber = new redis({
    host: 'rds',
    connectTimeout: 10000,
    port: 6379
})
const publisher = new redis({
    host: 'rds',
    connectTimeout: 10000,
    port: 6379
})
subsriber.on('error', err => console.log("Redis server error:" + err))

subsriber.on("message", function (channel, message) {
    try {
        console.log(`subscriber received: ${message}`)
        sockets.forEach(c => c.send(message))
    }
    catch (ex) {
        console.log("ERRO: " + ex)
    }
})

subsriber.subscribe("chat")

httpserver.listen(8081, () => console.log("My server is listening on 8081."))
websocket.on("request", request => {
    const con = request.accept(null, request.origin)
    con.on("open", () => console.log("opened"))
    con.on("close", () => console.log("closed"))
    con.on("message", async message => {
        try {
            console.log("ID: " + ID)
            // console.log(publisher.set('foo', 'bar')); // 'OK'
            console.log("publish message: " + message.utf8Data)
            publisher.publish("chat", message.utf8Data)
            var data = message.utf8Data
            var author_id = data.substring(0, data.indexOf(':'))
            // split to next one
            data = data.substring(data.indexOf(':') + 1)
            data = data.substring(data.indexOf(':') + 1)
            var msg = data.substring(data.indexOf(':' + 1))
            // Generate UUID and save message to db
            // Db schema: {"channel_id", "snowflake_id", "author_id", "message"}
            const query = {
                channel_id: 1,
                snowflake_id: generator.nextId().toString(),
                author_id: author_id,
                message: msg
            }
            await chat_messages.insertOne(query)
            console.log("Inserted into db")
        }
        catch (ex) {
            console.log("ERROR: " + ex)
        }
    })

    setTimeout(() => { }, 50000)
    sockets.push(con)
})
