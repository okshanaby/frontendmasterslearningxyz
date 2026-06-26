const express = require("express")
const server = require("http").createServer()

const app = express()

app.get("/", (req, res)=> {
	res.sendFile("index.html", {root: __dirname});
})

server.on("request", app)

server.listen(3001, ()=> console.log("Websocket Server running on port 3001"))
