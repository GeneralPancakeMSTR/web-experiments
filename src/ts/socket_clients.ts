import {io,Socket} from 'socket.io-client';

class test_client {
    socket: Socket;
    log: HTMLElement;
    topic:string;
    
    constructor() {
        this.topic = 'test-log';
        this.socket = io();


        this.socket.on(this.topic,arg => {
            console.log(arg);
            this.log.innerHTML = arg; 
        });

        this.log = document.createElement(this.topic);
        
    };

    appendLog(){
        document.body.appendChild(this.log);
    };

};

export {test_client};