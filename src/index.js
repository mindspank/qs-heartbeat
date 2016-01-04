import WebSocket from 'ws';
import restartService from './restart-service';
import ping from './productversion';

const hostname = 'wss://branch.qlik.com/anon/app/9573041f-0c45-4cb6-8166-64c2aac3c05d';
const originhost = 'http://branch.qlik.com';
const beatInterval = 60000; // 1 min

function beat() {
    setTimeout(() => {
        const socket = new WebSocket(hostname, {
            origin: originhost,
            rejectUnauthorized: false
        });
        
        // Socket opened, await first notification frame;
        socket.on('open', () => {
            socket.send(JSON.stringify(ping));
        });
        
        socket.on('message', (ev) => {
            const data = JSON.parse(ev);
            
            // Responded on ping. 
            if( data.id === 1 ) {
                socket.terminate();
                beat();
            };
            
            // Proxy is up and running but either QIX or QRS is down.
            // Keep beating to see if they recover.
            if( data.params && data.params.severity ) {
                socket.terminate();
                beat();
            };
            
        });
        
        // Connection Error
        socket.on('error', (error) => { 
            restartService('QlikSenseProxyService', (err, stdout) => {
                // Could not restart service, handle this later.
                if(err) {
                    console.log(err);
                };
                // Service restarted, beat again.
                beat();
            });
        });
        
    }, beatInterval)         
};
beat();