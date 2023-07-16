import {io,Socket} from 'socket.io-client';

class test_client {
    socket: Socket;
    log: HTMLElement;
    topic:string;
    
    constructor(log:HTMLElement) {                
        this.socket = io();
        
        this.topic = log.id;

        this.socket.on(this.topic,arg => {
            console.log(arg);
            this.log.innerHTML = arg; 
        });

        // this.log = document.createElement(this.topic);
        // this.log = <HTMLElement>document.getElementById(this.topic);
        this.log = log; 
        
    };

    // appendLog(){
    //     document.body.appendChild(this.log);
    // };

};

export {test_client};