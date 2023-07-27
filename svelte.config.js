import { default as adapter_static } from '@sveltejs/adapter-static';
import { default as adapter_node } from '@sveltejs/adapter-node';

var adapter; 

if(process.env.MODE === 'STATIC'){    
    adapter = () => adapter_static();
} else if (process.env.MODE === 'NODE') {       
    adapter = () => adapter_node();
}; 

import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
