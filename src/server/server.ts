import express, {Request, Response} from 'express';
import path from 'path';

const app = express(); 
const hostname = '0.0.0.0';
const port = 8000;

import * as http from 'http';
const server = http.createServer(app); 

import {Server} from 'socket.io';
const io = new Server(server); 

app.use(express.static(path.join(__dirname,'../dist')));

app.get('/',(req:Request,res:Response): void => {
    console.log(__dirname); 
    res.sendFile(path.join(__dirname,'../public/index.html'));
});

io.on('connection',(socket) => {
    console.log(socket.id);
    io.emit('test-log',socket.id); 
});

server.listen(port,hostname, () => {
    console.log(`[server]: Server is running at http://${hostname}:${port}`);
});
