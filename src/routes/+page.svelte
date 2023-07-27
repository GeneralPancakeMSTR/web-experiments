<script>
    import { io } from 'socket.io-client';
    import { onMount } from 'svelte';        

    function handleClick(){
        console.log('Button Clicked'); 
        const response_promise = fetch('/api/test');        
        
        response_promise.then(response => {
            const json_promise = response.json();
            json_promise.then(json_data => {
                console.log(json_data);
            });
        });
    };

    onMount(() => {
        console.log('Mounted');

        const socket = io(); 

        // const socket = io('http://localhost:3000',{transports:['websocket']});

        socket.on('ServerToClient',(message) => {
            console.log(message);
        });

        socket.on('PingServer',(message) => {
            console.log('Received PingServer command'); 
            console.log(message);            
            socket.emit('ClientToServer','Ping Response');
        });

        socket.emit('ClientToServer','Hello from client');

    });
</script>

<button on:click={handleClick}>Test /api/test</button>