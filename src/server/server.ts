import express, {type Request, type Response} from 'express'; // "type" prepend is a Svelte thing (https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax), see: @tsconfig/svelte/tsconfig.json
import cors from 'cors';


import path from 'path';

const app = express(); 
const hostname = '0.0.0.0';
const port = 8000;

import * as http from 'http';
const server = http.createServer(app); 

import {Server} from 'socket.io';
const io = new Server(server); 

// const identity4 = new Array([1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]);
// const test_matrix = new Array(
//     [.729,0,0,0],
//     [0,-.5155,-.5155,-1.4464],
//     [0,.5155,-.5155,1.6364],
//     [0,0,0,1]
//     );

const test_matrix = new Array(.729,0,0,0,0,-.5155,-.5155,-1.4464,0,.5155,-.5155,1.6364,0,0,0,1);

// Unblocks cross-origin-resource requests, or something. Probably unsafe to just blindly app.use(cors());
app.use(cors({origin:`http://127.0.0.1:${port}`})); 

app.use(express.static(path.join(__dirname,'../dist')));

app.get('/',(req:Request,res:Response): void => {
    console.log(__dirname);     
    res.sendFile(path.join(__dirname,'../public/index.html'));
});

app.get('/babylon_test',(req:Request,res:Response): void => {    
    res.sendFile(path.join(__dirname,'../public/babylon_test.html'));
});

app.get('/api/test',(req:Request,res:Response):void => {    
    res.header(200).json({matrix:test_matrix});
});

io.on('connection',(socket) => {
    console.log(socket.id);
    io.emit('test-log',socket.id); 
});

server.listen(port,hostname, () => {
    console.log(`[server]: Server is running at http://${hostname}:${port}`);
});
