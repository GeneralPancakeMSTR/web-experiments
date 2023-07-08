import * as esbuild from 'esbuild'

await esbuild.build({
    logLevel:"info",
    entryPoints: ['src/ts/index.ts'],
    bundle:true,
    minify:true,
    sourcemap:true,
    outfile:'dist/index.js'
})