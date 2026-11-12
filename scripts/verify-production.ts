import { spawn } from 'node:child_process';
import { chromium } from '@playwright/test';
const server=spawn(process.execPath,['--import','tsx','server/index.ts'],{env:{...process.env,NODE_ENV:'production',PORT:'3002',APP_URL:'http://localhost:3002'},stdio:'pipe'});
let output='';server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
try{
  let ready=false;for(let attempt=0;attempt<60;attempt++){try{if((await fetch('http://localhost:3002/api/health')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,200));}
  if(!ready)throw new Error('Production server failed to start: '+output);
  const config=await(await fetch('http://localhost:3002/api/config')).json();if(config.demo)throw new Error('Demo shortcuts must be disabled in production.');
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  try{const page=await browser.newPage({viewport:{width:360,height:800}});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&m.text().includes('Content Security Policy'))errors.push(m.text());});await page.goto('http://localhost:3002');await page.getByRole('heading',{name:'Care, without the uncertainty.'}).waitFor();await page.getByRole('button',{name:'Sign in / Register'}).click();await page.getByRole('heading',{name:'Welcome back',exact:true}).waitFor();if(await page.getByRole('button',{name:'Administrator',exact:true}).count())throw new Error('Demo login is exposed in the production UI.');if(errors.length)throw new Error(errors.join('\n'));console.log('Production smoke check passed: built assets, PostgreSQL API, mobile rendering, CSP, and demo-shortcut exclusion.');}finally{await browser.close();}
}finally{server.kill('SIGTERM');}
