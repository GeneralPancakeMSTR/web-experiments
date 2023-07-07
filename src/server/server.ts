import express from 'express';
import path from 'path';

const app = express();
const hostname = '0.0.0.0';
const port = 8000;

import * as http from 'http'; 
const server = http.createServer(app);

import {Server} from 'socket.io';
const io = new Server(server);

app.use(express.static(path.join(__dirname,'../dist')));

app.get('/',(req:express.Request,res:express.Response)=>{
    console.log(__dirname);
    res.sendFile(path.join(__dirname,'../dist/index.html'));
});

io.on('connection',(socket) => {
    console.log('A user connected');
    io.emit('test-log',socket.id);
});

server.listen(port,hostname, () => {
    console.log(`[server]: Server is running at http://${hostname}:${port}`);
});