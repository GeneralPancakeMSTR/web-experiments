This is a SvelteKit application adapted to use an integrated (if you can call it that?) Express webserver to handle API routes and running a SocketIO client. 

This is designed to be run from `build` only. I don't really know how to get the `preview` or `dev` modes to work (although SocketIO can be made to work in those modes using a vite plugin, but running Express at the same time is harder, if not impossible - not something I've managed to figure out, at any rate). 

## Problem (mostly solved) 
Once the application is running (from the command `npm restart`, preceded by `npm install` if just cloning this repository), it should be possible to navigate to `127.0.0.1:3000`, at which point (i.e. when the page loads): 
- The SocketIO client running `+page.svelte` should connect to the SocketIO server running in `server.js` (which it seems to, as you can see the Socket's id printed out to the server's console).
- The SocketIO client should receive a message ("Hello from Server") from the server (which it does, as you can see from the browser console).
- **The SocketIO client should send a message ("Hello from client") to the server, which the server should print out to the console, which it does not.**
  - Okay so it turns out if you add the "ClientToServer" handler to the socket when it connects, i.e. inside the `io.on('connection'...` block, things work as expected. 
  - But it doesn't work globally, e.g. if I have `io.on('ClientToServer'...` somewhere in the server, and I fire a `socket.emit('ClientToServer',...` event from the client, the `io.on('ClientToServer'...` doesn't run. I thought it used to work that way? 
- Also try the `Test /api/test` button, keep an eye on the server and browser console. 

Interesting, I guess. 

Also setting the transport to `websocket` on the server and client sides doesn't seem to make a difference. 

## References 
- [Using WebSockets With SvelteKit](https://joyofcode.xyz/using-websockets-with-sveltekit)
- [How to Build a Static SvelteKit Site](https://www.philkruft.dev/blog/how-to-build-a-static-sveltekit-site/)
  - I got this sort of working, i.e. it builds, but I don't know how to serve it? 
  - Well I seem to have gotten it working, see [reddit comment](https://www.reddit.com/r/sveltejs/comments/11woaej/is_it_possible_to_use_the_adapterstatic_with/jd1nbog/)



## Initialization (Typescript skeleton project, no linting)
```bash
npm create svelte@latest
```
- Additional Dependencies 
```bash
npm install --save-dev @sveltejs/adapter-node
npm install --save-dev @sveltejs/adapter-static
npm install --save-dev express @types/express
npm install --save-dev socket.io socket.io-client 
npm install esbuild # I think?
```

## Notes (`adapter-node`)
Create a new `server` directory at the root of the project. 
```
mkdir server
```
Create `server/esbuild.mjs` as 
```mjs
// server/esbuild.mjs
import esbuild from 'esbuild';

await esbuild.build({
    logLevel:'info',
    entryPoints:['server/server.ts'],
    bundle:true,
    outfile:'build/server.js',
    // Resolves: [Error] Top-level await is currently not supported with the "cjs" output format.
    // 'You need to set the output format to "esm" for "import.meta" to work correctly.
    format:'esm',
    // Resolves: Error: Dynamic import of "path" is not supported. 
    // Possible to just exclude/externalize the path module? Not sure how though 
    packages:'external'
})
```
Create `server/tsconfig.json` as 
```json
// server/tsconfig.json
{    
    "compilerOptions": {
        "target": "ESNext",
        "module": "ESNext",        
        "allowJs": true,
        "noImplicitAny": true,
        "removeComments": true,
        "resolveJsonModule":true,        
        "sourceMap": true,
        "outDir": "dist",
        "strict": true,
        "lib": ["ESNext","dom","ES2018.Regexp"],
        "baseUrl": "./",
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "emitDecoratorMetadata": true,
        "moduleResolution": "Node",
        "skipLibCheck": true,
        "isolatedModules": true
    }
}
```
Create `server/server.ts` as 
```ts
// server/server.ts
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

```

## Notes (`adapter-static`)
`adapter-static` works a little bit differently from `adapter-node`, and seems like a better solution for me personally to be honest (mainly because it builds faster and I don't understand how non-prerendered pages work). The changes that need to be made to get it working are as follows 

Create a new `server_static` directory at the root of the project. 
```
mkdir server_static
```
Create `server_static/esbuild_static.mjs` as 
```mjs
// server_static/esbuild_static.mjs
import esbuild from 'esbuild';

await esbuild.build({
    logLevel:'info',
    entryPoints:['server_static/server_static.ts'],
    bundle:true,
    // .cjs Resolves: ReferenceError: require is not defined in ES module scope, you can use import instead
    outfile:'dist/server_static.cjs', 
    platform:'node'
})
```
Copy `server/tsconfig.json` to `server_static/tsconfig.json`.

Create `server_static/server_static.ts` as (note lack of import or use of of `build/handler.js`)
```ts
// server_static/server_static.ts
import express, {response, type Request, type Response } from "express";
import { createServer } from 'http';
import { Server } from 'socket.io';
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
        console.log(message);
    });

    socket.on('disconnect',(reason) => {
        console.log('Client disconnected');
        console.log(socket.id);
    });    
});

function api_test(req:Request,res:Response):void {
    io.emit('PingServer','');
    res.header(200).json({message:'ServerToClient emission'});
};

app.get('/api/test',api_test);

app.use(express.static(path.join(__dirname,'../build')));

// Routes before this point are handled by express 
// Routes after this point are handled by SvelteKit
app.get('*',(req:Request,res:Response) => {
    res.sendFile(path.join(__dirname,'../build/index.html'));    
});
 

server.listen(port, ()=> {
    console.log(`[server]: Server is running at http://*:${port}`);
});
```

## SvelteKit and `package.json`
Create `src/routes/+page.svelte` as 
```html
<!-- src/routes/+page.svelte -->
<script>
    import { io } from 'socket.io-client';
    import { onMount } from 'svelte';        

    function handleClick(){
        console.log('Button Clicked'); 
        const response_promise = fetch('/api/test');        
        
        response_promise.then(response => {
            const json_promise = response.json();
            json_promise.then(json_data => {
                console.log(json_data);
            });
        });
    };

    onMount(() => {
        console.log('Mounted');

        const socket = io(); 

        // const socket = io('http://localhost:3000',{transports:['websocket']});

        socket.on('ServerToClient',(message) => {
            console.log(message);
        });

        socket.on('PingServer',(message) => {
            console.log('Received PingServer command'); 
            console.log(message);            
            socket.emit('ClientToServer','Ping Response');
        });

        socket.emit('ClientToServer','Hello from client');

    });
</script>

<button on:click={handleClick}>Test /api/test</button>
```

Create a `src/routes/+layout.ts` file with the contents 
```ts
// src/routes/+layout.ts
export const prerender = true; 
```
This tells SvelteKit that everything in the routes directory is static/to be prerendered, or something. 

Modify `svelte.config.js` to differentiate between `adapter-static` and `adapter-node` based on a `MODE` environment variable as follows 
```js
// svelte.config.js
import { default as adapter_static } from '@sveltejs/adapter-static';
import { default as adapter_node } from '@sveltejs/adapter-node';

var adapter; 

if(process.env.MODE === 'STATIC'){    
    adapter = () => adapter_static();
} else if (process.env.MODE === 'NODE') {       
    adapter = () => adapter_node();
}; 
...
```

Modify `package.json` as follows
```json
// package.json
...
"server":"rm -rf dist && node server/esbuild.mjs", // This builds the Express and SocketIO server at server/server.ts and puts it into ./build/server.js
"server_static":"rm -rf dist && node server_static/esbuild_static.mjs", // Build Express and SocketIO server at server_static/server.ts into /dist/server.js for adapter-static mode 
"build": "MODE=NODE vite build && npm run server", // Do vite build and build the express server using adapter-node
"build_static": "MODE=STATIC vite build && npm run server_static", // Do vite build and build the express server using adapter-static
"start":"node build/server.js", // Start the application (from the express server) under adapter-node mode
"start_static":"node dist/server_static.cjs", // Start the application (from the express server) under adapter-static mode
"restart":"npm run build && npm run start", // Rebuild and restart the server (adapter-node)
"restart_static":"npm run build_static && npm run start_static", // Rebuild and restart the server (adapter-static)
...
```