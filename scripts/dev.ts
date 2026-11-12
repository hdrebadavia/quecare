import { spawn } from 'node:child_process';
const processes = [spawn('npm', ['run', 'dev:server'], { stdio: 'inherit' }), spawn('npm', ['run', 'dev:client'], { stdio: 'inherit' })];
function stop() { processes.forEach(p => p.kill('SIGTERM')); }
process.on('SIGINT', stop); process.on('SIGTERM', stop);
processes.forEach(p => p.on('exit', code => { if (code) { stop(); process.exitCode = code; } }));
