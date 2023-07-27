import express, {type Request, type Response } from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { handler } from '../build/handler.js';
import path from 'path'; 

const port = 3000; 
const app = express(); 
const server = createServer(app); 
// const io = new Server(server,{transports:['websocket']});
const io = new Server(server);

io.on('connection',(socket) => {
    console.log('Socket connected to the server');    
    socket.emit('ServerToClient','Hello from Server');
    console.log(socket.id);
   
    socket.on('ClientToServer',(message) => {
        // This works 
        console.log(message);
    });

    socket.on('disconnect',(reason) => {
        console.log('Client disconnected');
        console.log(socket.id);
    });
    
});

// This doesn't work 
io.on('ClientToServer',(message) => {
    console.log('Global client to server event');
    console.log(message);
});

function api_test(req:Request,res:Response):void {
    io.emit('PingServer','');
    res.header(200).json({message:'ServerToClient emission'});
};

app.get('/api/test',api_test);

// Routes before this point are handled by express 
// Routes after this point are handled by SvelteKit 
app.use(handler); 

server.listen(port, ()=> {
    console.log(`[server]: Server is running at http://*:${port}`);
});
