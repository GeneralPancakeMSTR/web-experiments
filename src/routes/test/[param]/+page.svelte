<script lang="ts">        
    import type { PageData } from './$types';

    export let data: PageData; 

    import { onMount } from 'svelte';

    function handleClick(){
        console.log('Button Clicked');         
    };

    onMount(() => {
        console.log('Mounted');        
    });

</script>

<h1>{data.title}</h1>

<button on:click={handleClick}>Test page</button>