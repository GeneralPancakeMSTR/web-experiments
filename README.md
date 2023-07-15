## Esbuild Branch 

## Components
- NodeJS (Runtime)
- Typescript 
- Express (Backend/Server framework)
- Babylon
- ~~Webpack~~
- ESBuild
- SocketIO

## Instructions 
- Install `npm`
- `npm install`
- `npm run start`

## Documentation

## References 
- [Configuring webpack + express compatibility](https://binyamin.medium.com/creating-a-node-express-webpack-app-with-dev-and-prod-builds-a4962ce51334)
- [Basic Babylon](https://doc.babylonjs.com/guidedLearning/createAGame/gettingSetUp)
- [esbuild docs](https://esbuild.github.io/)
- Other stuff that tended to use `esbuild-node-tsc`, which I decided was unnecessary, but may be linked below. 
- The search "migrating from webpack to esbuild" produces some interesting links. 

Note that a drawback of esbuild is that it doesn't throw errors at compile ([see e.g.](https://github.com/evanw/esbuild/issues/1631), or directly [from the docs](https://esbuild.github.io/content-types/#typescript)). You can run `tsc -noEmit` to actually get compile errors, but it's slow. So maybe just pay attention to the editor? 

That whole [section on TypeScript](https://esbuild.github.io/content-types/#typescript) might actually be an interesting read. 

Things to read about 
- Typescript/Javascript generics, of all forms. 
- More on promises, async, await. 

#

## Initialization Steps 
- `npm init`
- `npm install --save-dev typescript @types/node`
- Make `tsconfig.json`
- `npm install --save-dev express @types/express`
- Create Express Server 
  - `mkdir src`, `cd src`, `mkdir server`, -> make `server.ts`.
- `npm install --save-dev esbuild esbuild-node-tsc` (Omitting `nodemon` for the moment, refer to [this doc](https://mosano.eu/post/using-esbuild-to-bundle-node-api/) for setup). 
- Add scripts to `package.json` (note that the `dev` script doesn't do anything, it's just a placeholder)
    ```json 
    // package.json
    "scripts": {
        "dev": "nodemon",
        "build": "rm -rf build && etsc",
        "start": "node ./build/server.js",
        "restart": "npm run build && npm run start"
    },
    ```

- So now it builds the server, which is great, but how do I get it to build and bundle the frontend...
- Create `src/html/index.html` which has `index.js` embedded into it (which just logs something like "Hello from typescript" to the console) and is derived from `src/ts/index.ts`. 
- [Maybe a `etsc.config.js`](https://www.npmjs.com/package/esbuild-node-tsc)? 
- But I'm not convinced that you need `esbuild-node-tsc` at all. E.g. 
    ```bash
    ./node_modules/.bin/esbuild src/server/server.ts --bundle --sourcemap --platform=node --outfile=build/server.js
    ```
    seems to work? 

## Initialization Take 2 (omit esbuild-node-tsc) 
- Copy `web-experiments-esbuild-blank` to `web-experiments-esbuild`, work from there, until we have this sorted out. 
- `npm init` (defaults except for description, which seems to automatically pull the README.)
- `npm install --save-dev typescript @types/node`
- `npm install --save-dev express @types/express`
- Install `esbuild` [how the docs tell you to](https://esbuild.github.io/getting-started/#install-esbuild) 
  - `npm install --save-exact esbuild`
  - `esbuild` works directly in `package.json` now (although it may have before too, idk, regardless, you don't need to do `./node_modules/.bin/esbuild`).
- Add the following scripts to `package.json`
    ```json
    // package.json
    "scripts": {
        "build": "rm -rf dist && esbuild src/server/server.ts --bundle --platform=node --outfile=dist/server.js",
        "start": "node ./dist/server.js"
    },
    ```
- Great that works, let's try to build from a [build script](https://esbuild.github.io/getting-started/#build-scripts)
  - Evidently you need the [`#!/usr/bin/env node`](https://dev.to/marcinwosinek/how-to-configure-esbuild-with-a-build-script-2pcf) declaration at the top (otherwise you get a parentheses missing error). 
  - Oh I see. Or you can run it with `node` directly, and then you neither need to make the script executable, nor put the `#!` declaration at the top, which I prefer tbh. Cool to know about that trick, though. 
  - Alright this is awesome. I think this is the way. 
    ```json
    // package.json
    "scripts": {
        "build":"rm -rf dist && node ./esbuild_server.mjs && node ./esbuild_index.mjs",    
        "start": "node ./dist/server.js",
        "restart": "npm run build && npm run start"
    },
    ```
- Docs mention something about [not supporting e.g. `__dirname`](https://esbuild.github.io/getting-started/#bundling-for-node), which I use; not sure how that's going to affect me, but the build process still works, so, idk. 
  - Ok so it builds but nothing works. Like at all. 
  - Workaround is setting `--packages=external` in `esbuild_server.mjs`, which basically means you still need `node_modules` on the server-side, which I guess is ok because server lives on server, but it's worth looking into alternatives. 
  - **Welp** I was entirely wrong about this, it turns out. Problem was that I was statically hosting `/public` (`app.use(express.static(path.join(__dirname,'../public')));)`), not `/dist` (`app.use(express.static(path.join(__dirname,'../dist')));`), which made the whole application fail silently. 
- Aaaand it works. And holy crap is it fast. 


## Promises 
```ts
        // const delay = new Promise<boolean>
        // var timeout_state = false; 
        // const timeout = setTimeout((timeout_state) => {timeout_state=true},100,timeout_state);
        

        // var delay = new Promise<boolean>((resolve,reject) => {
        //     const timeout = setTimeout(() => {
        //         resolve(true); 
        //     }, 2000);
        // });
        

        // delay.then((resolve_input:boolean) => {
        //     console.log(`resolve(${resolve_input}) Called`);
        // }); 
        // delay.catch((reject_input:Error) => {
        //     console.log(`reject(${reject_input.message}) Called`);
        // });
```

## Babylon Packages 
[Babylon.js ES6 support with Tree Shaking](https://doc.babylonjs.com/setup/frameworkPackages/es6Support#available-packages)

Basically, instead of loading the entirety of Babylon (e.g. `import * as BABYLON from 'babylonjs'`), just load the components that you need. But the right way to do this is with `@babylon` packages. 

The point here is that the build will be orders of magnitude faster than if all of babylon is included. 

Here's what I'm going to start with (probably won't need `loaders` or `gui` for a while). 

```
npm install --save-dev @babylonjs/core
npm install --save-dev @babylonjs/materials
npm install --save-dev @babylonjs/loaders
npm install --save-dev @babylonjs/gui
```

## Svelte ?
Let's start with 
`npm install --save-dev svelte`

### References 
- [Maybe useful template example](https://github.com/Tazeg/svelte-esbuild-template)
