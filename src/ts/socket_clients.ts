import {io,Socket} from 'socket.io-client';

class test_client {
    socket: Socket;
    log: HTMLElement;
    topic:string;
    
    constructor(log:HTMLElement) {        
        this.socket = io();
        this.topic = log.id;

        this.socket.on(this.topic,arg => {            
            this.log.innerHTML = arg; 
            console.log(arg);
        });

        this.log = log; 
        
    };
};

export {test_client};