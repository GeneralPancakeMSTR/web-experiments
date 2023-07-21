<script lang="ts">
    import {onMount} from 'svelte';    
    import {test_client} from '../ts/socket_clients';    
    
    // More motivation for using SvelteKit: https://stackoverflow.com/a/68840030/2391876
    const urlParams = new URLSearchParams(window.location.search);  
    let socket_name = urlParams.get('name') ?? '<No socket name in URL params>';

    onMount(function(){        
        let log = <HTMLElement>document.getElementById(socket_name);
        const socket = new test_client(log);        
    });

    let handleClick = ():void =>{
        console.log('Button Clicked');         
        const response_promise = fetch(`http://localhost:8000/api/ping_socket_by_name?name=${socket_name}`,{method:'GET'});
        response_promise.then(response => {
            const json_promise = response.json();
            json_promise.then(json_data => console.log(json_data));
        });
    };
    
</script>

<div class="socket">Socket {socket_name}</div>
<div id={socket_name}></div>
<button on:click={handleClick}> Ping Socket </button>

<style>
    .socket {        
        color:black;
    }
</style>


