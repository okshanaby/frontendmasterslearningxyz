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

let isShuttingDown = false;

process.on('SIGINT', () => {
    // Prevent multiple Ctrl+C presses from triggering shutdown logic again
    if (isShuttingDown) return; 
    isShuttingDown = true;

    console.log('\nGracefully shutting down...');

    // 1. Close all connected WebSocket clients
    wss.clients.forEach(function each(client) {
        client.close();
    });

	console.log('\nAll websockets client have been closed.\n')
	
    // 2. Stop the HTTP server from accepting new requests
    server.close(() => {
        shutdownDB();
    });
});

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


    db.run(`INSERT INTO visitors (count, time)
        VALUES (${numOfClients}, datetime('now'))
    `);

	// ON CLIENT CLOSE 
	ws.on("close", ()=> {
		// Recalculate the actual size AFTER the disconnect
        const currentCount = wss.clients.size;
        wss.broadcast(`Current Visitors: ${currentCount}`);
        console.log("Client has disconnected. Remaining: ", currentCount);
	})
})

/** end websockets */
/** begin database */
const sqlite = require('sqlite3');
const db = new sqlite.Database(':memory:');

db.serialize(() => {
    db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `)
});

function getCounts() {
    db.each("SELECT * FROM visitors", (err, row) => {
        console.log(row);
    });
}

function shutdownDB() {
    console.log('Shutting down db');

    getCounts();
    db.close();

}