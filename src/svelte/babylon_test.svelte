<script lang="ts">
    import {onMount} from 'svelte';    
    import {babylon_test} from '../ts/babylon_apps';    

    

    onMount(function(){
        
        const babylon_canvas = <HTMLCanvasElement>document.getElementById('babylon_canvas');
        const babylon_test_app = new babylon_test(babylon_canvas); 
        babylon_test_app.runRenderLoop(); 

        const response_promise = fetch('http://localhost:8000/api/test',{method:'GET'});
        response_promise.then(response => {
            const json_promise = response.json();
            json_promise.then(json_data => {babylon_test_app.test_matrix = json_data.matrix});
        });
        
    });
    
</script>

<div class="test">
    <p>Hello World</p>    
</div>

<p></p>

<canvas id="babylon_canvas"></canvas>

<style>

    canvas {        
        width: 100%; 
        height: 100%; 
        margin:0;
        padding:0;        
    }

    .test {
        display: inline-block;
        background-color:blueviolet;
        color:white;
    }


</style>


