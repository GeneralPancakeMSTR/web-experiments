import {test_client} from './socket_clients';

const socketio_log = new test_client(); 
socketio_log.appendLog(); 

const res = fetch('http://localhost:8000/api/test')

console.log(res); 
