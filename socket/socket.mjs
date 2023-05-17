import http from 'http';
import ws from 'websocket';
import redis from 'ioredis';

const APPID = process.env.APPID
const WebSocketServer = ws.server
const httpserver = http.createServer()
const websocket = new WebSocketServer({
    "httpServer": httpserver
})
const sockets = []

/*
let options = {socket_keepalive : true, socket_initialdelay : 200000};
const subsriber = redis.createClient({
    host: "redis",
    port: 6379,
    options: options,
    pingInterval: 1000 // <- add pingInterval
})
const publisher = redis.createClient({
    host: "redis",
    options: options,
    port: 6379,
    pingInterval: 1000 // <- add pingInterval
})

subsriber.on('connect', function () {
    console.log("connecting subscriber")
    var socket = subsriber.stream
    socket.setKeepAlive(true, 30 * 1000)
})
publisher.on('connect', function () {
    console.log("connecting publisher")
    var socket = publisher.stream
    socket.setKeepAlive(true, 30 * 1000)
})
*/
/*
const subsriber = redis.createClient('redis://rds:6379')
const publisher = redis.createClient('redis://rds:6379')
*/
const subsriber = new redis({
    host: 'rds',
    connectTimeout: 10000,
    // lazyConnect: true,
    port: 6379
})
const publisher = new redis({
    host: 'rds',
    connectTimeout: 10000,
    // lazyConnect: true,
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

httpserver.listen(8080, () => console.log("My server is listening on 8080."))
websocket.on("request", request => {
    const con = request.accept(null, request.origin)
    con.on("open", () => console.log("opened"))
    con.on("close", () => console.log("closed"))
    con.on("message", message => {
        try {
        console.log(publisher.set('foo', 'bar')); // 'OK'
        console.log("publish message: " + message.utf8Data)
        // con.send(message.utf8Data);
        console.log(publisher.publish("chat", message.utf8Data))
        console.log("published message")
        }
        catch (ex) {
            console.log("ERROR: " + ex)
        }
    })

    setTimeout(() => con.send('connected successfully.'), 50000)
    sockets.push(con)
})
