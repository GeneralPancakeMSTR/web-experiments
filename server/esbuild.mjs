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
    packages:'external',
    platform:'node' // [ ] See if this fixes anything? 
})