import * as esbuild from 'esbuild'

const name = 'babylon_test';

await esbuild.build({
    logLevel:"info",
    entryPoints: [`src/ts/${name}.ts`],
    bundle:true,
    minify:true,
    sourcemap:true,
    outfile:`dist/${name}.js`
})