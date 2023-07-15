import express, {Request, Response} from 'express';
import path from 'path';

const app = express(); 
const hostname = '0.0.0.0';
const port = 8000;

import * as http from 'http';
const server = http.createServer(app); 

import {Server} from 'socket.io';
const io = new Server(server); 

const identity4 = new Array([1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]);

app.use(express.static(path.join(__dirname,'../dist')));

app.get('/',(req:Request,res:Response): void => {
    console.log(__dirname);     
    res.sendFile(path.join(__dirname,'../public/index.html'));
});

app.get('/babylon_test',(req:Request,res:Response): void => {    
    res.sendFile(path.join(__dirname,'../public/babylon_test.html'));
});

app.get('/api/test',(req:Request,res:Response):void => {
    res.json({matrix:identity4.toString()});
})

io.on('connection',(socket) => {
    console.log(socket.id);
    io.emit('test-log',socket.id); 
});

server.listen(port,hostname, () => {
    console.log(`[server]: Server is running at http://${hostname}:${port}`);
});
