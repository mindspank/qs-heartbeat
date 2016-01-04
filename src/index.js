import WebSocket from 'ws';
import ping from './productversion';
import restartService from './restart-service';

const hostname = 'ws://localhost:4848/app/';
const originhost = 'http://branch.qlik.com';
const beatInterval = 30000;

function beat() {
    setTimeout(() => {
        const socket = new WebSocket(hostname, {
            origin: originhost,
            rejectUnauthorized: false
        });
        
        socket.on('open', () => {
            // Socket open, send single frame and await response.
            socket.send( JSON.stringify(ping) );
        });
        
        socket.on('message', (ev) => {
            const data = JSON.parse(ev);
            
            // First frame will be a notification, ignore it. 
            if( !data.result ) {
                return;
            };
            
            // QIX responded on ping
            if( data.id === 1 ) {
                socket.terminate();
                
                // Continue beating            
                setTimeout(beat, beatInterval);
            };
            
        });
        
        // Connection Error
        socket.on('error', (error) => {            
            restartService('Spooler', (err, stdout) => {
                if( err ) {
                    // Could not restart service, handle this later.
                }
                // Service restarted, beat again.
                beat();
            });
        });
        
    }, beatInterval)         
}();