import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';

await esbuild.build({
    logLevel:"info",
    entryPoints: ['src/ts/index.ts'],
    bundle:true,
    minify:true,
    sourcemap:true,
    outfile:'dist/index.js',
    plugins : [
        esbuildSvelte({
            preprocess: sveltePreprocess(),
        }),
    ],
})