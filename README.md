## esbuild + SocketIO + Svelte + Express Minimal/Template

## Components
- NodeJS (Runtime)
- Typescript 
- Express (Backend/Server framework)
- ESBuild
- SocketIO
- Svelte 

## Instructions 
- Install `npm`
- `npm install`
- `npm run build`
- `npm run start`

## Motivation and Explanation 
The idea here is that there are some arbitrary number of SocketIO sockets, e.g. `a`,`b`, and `c`. When a link for one of these sockets is clicked from the index page (`src/svelte/index.svelte`), the socket is created (`src/svelte/socket_component.svelte`), and should only receive messages from server emissions to its name (e.g. socket `a` should only receive a message when the server does a `io.emit('a','Some message to socket a')`). 

This project demonstrates this functionality at a proof-of-concept level. It's probably badly written to the point of being offensive and also has some problems, e.g. sockets losing their connections, and for some reason the api not being called sometimes when the "Ping Socket" buttons are clicked. But hopefully it gets the idea across. 

Roughly the way things work is that the index links to a socket (e.g. `a`) as `/socket?name=a`, and then the `src/svelte/socket_component.svelte` page uses the `name` query parameter (to construct its socket). But, weirdly (in my opinion) the `socket` route published by the server *does not* use the `name` parameter at all.

What would be *nice*, and this is where `SvelteKit` comes in, is if we could put `src/svelte/socket_component.svelte` at `src/routes/socket/[name]/+svelte_component.svelte`, and then link to a socket as `/socket/a` (I think?) from the index, so that `svelte_component.svelte` would have access to the `name` parameter (to create its socket), and everything would make a lot more sense, I think. 

But, I can't get `SvelteKit` to work, especially with the Express-based api, esbuild, etc. 

## Getting Svelte Working
Uses the [esbuild-svelte](https://github.com/EMH333/esbuild-svelte) repository as a reference. 
```
npm install @tsconfig/svelte
npm install esbuild
npm install esbuild-svelte
npm install svelte
npm install svelte-check
npm install svelte-preprocess
```

This line needs to be removed from `tsconfig.json`, I don't know why 
```json
// Remove from tsconfig.json 
"typeRoots": ["./node_modules/@types"],
```

The following needs to be added to `tsconfig.json`

```json
{
    "compilerOptions": {
        ...        
        "types": [
            "svelte"
        ]
    },
}
```

And then you basically have to add some esbuild-svelte stuff to "the" `esbuild.mjs` file:

```mjs
import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte'; // Added 
import sveltePreprocess from 'svelte-preprocess'; // Added 

await esbuild.build({
    logLevel:"info",
    entryPoints: ['src/ts/index.ts'],
    bundle:true,
    minify:true,
    sourcemap:true,
    outfile:'dist/index.js',
    plugins : [
        esbuildSvelte({
            preprocess: sveltePreprocess(), // Added this plugin 
        }),
    ],
})
```

To get typescript embedded in `.svelte` files to work properly (e.g. not throw errors in the editor), it seems that you need the [Svelte for VS Code plugin](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode), not sure if there is any other way to get it to work. 

Be sure to remove 

```json
"files.associations": {"*.svelte":"html"}
```

from VSCode settings, and add this: 

```json
"svelte.enable-ts-plugin":true
```

This should enable type-checking, etc. with typescript embedded in `svelte` components. 

### References 
- [Maybe useful template example](https://github.com/Tazeg/svelte-esbuild-template)
