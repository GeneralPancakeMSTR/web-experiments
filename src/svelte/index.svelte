<script lang="ts">
    import {onMount} from 'svelte';    
    import {test_client} from '../ts/socket_clients';    

    let inputBinding: HTMLInputElement;

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
    <p>Hello World</p>
    <label for="testingInput">This gets changed when you press the button:</label>
    <input type="test" name="testingInput" bind:this="{inputBinding}"/>
</div>

<p></p>

<div id="test-log"></div>

<style>
    .test {
        display: inline-block;
        background-color:blueviolet;
        color:white;
    }
</style>


