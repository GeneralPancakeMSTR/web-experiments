import esbuild from 'esbuild';
import esbuildSvelte from 'esbuild-svelte';
import sveltePreprocess from 'svelte-preprocess';

let name = 'socket_component_container'

await esbuild.build({
    logLevel:"info",
    entryPoints: [`src/ts/${name}.ts`],
    bundle:true,
    minify:true,
    sourcemap:true,
    outfile:`dist/${name}.js`,
    plugins : [
        esbuildSvelte({
            preprocess: sveltePreprocess(),
        }),
    ],
})