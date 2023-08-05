import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (({ params }) => {
    if(params.param){
        return {
            title: `${params.param}`,
        }
    }
    
    throw error(404, 'Not found');
}) satisfies PageLoad;