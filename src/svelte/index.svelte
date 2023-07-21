<script lang="ts">
    import {onMount} from 'svelte';    
    import {test_client} from '../ts/socket_clients';    

    onMount(function(){
        let log = <HTMLElement>document.getElementById('test-log');
        const socketio_log = new test_client(log);        

        const response_promise = fetch('http://localhost:8000/api/test',{method:'GET'});
        response_promise.then(response => {
            const json_promise = response.json();
            json_promise.then(json_data => console.log(json_data));
        });        
    });
    
</script>

<div class="test">
    <p class="test">Hello World</p>
</div>

<p></p>

<h2>SocketIO Log</h2>
<div id="test-log"></div>

<br>
<a href="/socket?name=a">Socket a</a>
<br>
<a href="/socket?name=b">Socket b</a>
<br>
<a href="/socket?name=c">Socket c</a>

<style>
    .test {
        display: inline-block;
        background-color:#3f7f86;
        color:white;
    }
</style>


