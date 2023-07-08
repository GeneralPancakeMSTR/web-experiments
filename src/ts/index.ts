import {babylon_app} from './babylon';
import {test_client} from './socket_clients';

const new_babylon_app = new babylon_app(); 
// new_babylon_app.appendCanvas(); 
new_babylon_app.runRenderLoop(); 


const socketio_log = new test_client(); 
socketio_log.appendLog(); 


