import WebSocket from 'ws';
import restartService from './restart-service';

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
        socket.on('open', null);
        
        socket.on('message', (ev) => {
            const data = JSON.parse(ev);
            
            // Notification frame - we are connected. 
            if( data.method === 'OnAuthenticationInformation' ) {
                socket.terminate();
                beat();
            };
            
            if( data.error ) {
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