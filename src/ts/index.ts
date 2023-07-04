import {babylon_app} from './babylon';
import {test_client} from './socket_clients';

const socketio_log = new test_client(); 

new babylon_app();

socketio_log.appendLog(); 