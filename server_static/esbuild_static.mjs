import esbuild from 'esbuild';

await esbuild.build({
    logLevel:'info',
    entryPoints:['server_static/server_static.ts'],
    bundle:true,
    // .cjs Resolves: ReferenceError: require is not defined in ES module scope, you can use import instead
    outfile:'dist/server_static.cjs', 
    platform:'node'
})