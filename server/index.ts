import 'dotenv/config';
import { app } from './app.js';
import { pool } from './db.js';
const port=Number(process.env.PORT||3001);
await pool.query('SELECT 1');
const server=app.listen(port,process.env.NODE_ENV==='production'?'0.0.0.0':'127.0.0.1',()=>console.log(`QueCare API ready at http://localhost:${port}`));
function shutdown(){server.close(()=>void pool.end());}
process.on('SIGINT',shutdown);process.on('SIGTERM',shutdown);
