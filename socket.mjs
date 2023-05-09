import http from 'http';
import ws from 'websocket';

const APPID = process.env.APPID
const WebSocketServer = ws.server
const httpserver = http.createServer()
const websocket = new WebSocketServer({
    "httpServer": httpserver
})

httpserver.listen(8080, () => console.log("My server is listening on 8080."))
websocket.on("request", request=> {
    const con = request.accept(null, request.origin)
    con.on("open", () => console.log("opened"))
    con.on("close", () => console.log("closed"))
    con.on("message", message => {
        console.log("received message: " + message.utf8Data)
        con.send(message.utf8Data);
    })

    setTimeout(() => con.send('connected successfully.'), 5000)
})
