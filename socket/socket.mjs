import http from 'http';
import ws from 'websocket';
import redis from 'ioredis';

const ID = process.env.ID
const WebSocketServer = ws.server
const httpserver = http.createServer()
const websocket = new WebSocketServer({
    "httpServer": httpserver
})
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
    con.on("message", message => {
        try {
        console.log("ID: " + ID)
        console.log(publisher.set('foo', 'bar')); // 'OK'
        console.log("publish message: " + message.utf8Data)
        // con.send(message.utf8Data);
        console.log(publisher.publish("chat", message.utf8Data))
        }
        catch (ex) {
            console.log("ERROR: " + ex)
        }
    })

    setTimeout(() => con.send('connected successfully.'), 50000)
    sockets.push(con)
})
