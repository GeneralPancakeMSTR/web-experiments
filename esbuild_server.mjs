import * as esbuild from 'esbuild'

await esbuild.build({
    logLevel:"info",
    entryPoints: ['src/server/server.ts'],
    bundle:true,
    platform:'node',
    outfile:'dist/server.js'
})