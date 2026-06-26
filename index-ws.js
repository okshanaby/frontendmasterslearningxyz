const express = require("express")
const server = require("http").createServer()

const app = express()

app.get("/", (req, res)=> {
	res.sendFile("index.html", {root: __dirname});
})

server.on("request", app)

server.listen(3000, ()=> console.log("Websocket Server running on port 3000"))

/** Begin Websocket Server Code */

const WebSocketServer = require("ws").Server;

const wss = new WebSocketServer({server})

// Custom broadcast function
// Added a check to ensure we only send to OPEN clients
wss.broadcast = (data) => {
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
};


wss.on("connection", (ws)=> {
	const numOfClients = wss.clients.size
	console.log("Connected clients: ", numOfClients)

	wss.broadcast(`Current Visitors: ${numOfClients}`);

	// ON CLIENT OPEN 
	if(ws.readyState === ws.OPEN) {
		ws.send("Welcome to my server")
	}

	// ON CLIENT CLOSE 
	ws.on("close", ()=> {
		// Recalculate the actual size AFTER the disconnect
        const currentCount = wss.clients.size;
        wss.broadcast(`Current Visitors: ${currentCount}`);
        console.log("Client has disconnected. Remaining: ", currentCount);
	})
})