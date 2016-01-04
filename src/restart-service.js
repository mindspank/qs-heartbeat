import * as child from 'child_process';

export default function foo(service, callback) {
    child.exec(`net stop ${service} && net start ${service}`, (error, stdout, stderr) => {
        if (error !== null) {
            callback(error);
        }
        callback(null, stdout);
    });
};