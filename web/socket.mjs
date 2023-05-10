import http from 'http';
import ws from 'websocket';
import redis from 'redis';

const APPID = process.env.APPID
const WebSocketServer = ws.server
const httpserver = http.createServer()
const websocket = new WebSocketServer({
    "httpServer": httpserver
})
const sockets = []

const subsriber = redis.createClient({
    port: 6379,
    host: 'localhost'
})

const publisher = redis.createClient({
    port: 6379,
    host: 'localhost'
})

subsriber.on("message", function(channel, message) {
    console.log(`received: ${message}`)
    sockets.forEach(c => c.send(message))
})

subsriber.subscribe("chat")

httpserver.listen(8080, () => console.log("My server is listening on 8080."))
websocket.on("request", request=> {
    const con = request.accept(null, request.origin)
    con.on("open", () => console.log("opened"))
    con.on("close", () => console.log("closed"))
    con.on("message", message => {
        console.log("received message: " + message.utf8Data)
        // con.send(message.utf8Data);
        publisher.publish("chat", message.utf8Data)
    })

    setTimeout(() => con.send('connected successfully.'), 5000)
    sockets.push(con)
})
