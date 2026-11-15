import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
// Serve built assets locally; API responses are controlled to reproduce an outage.
// This test never connects to production or creates patient data.
const root=resolve('dist');
const server=createServer(async(req,res)=>{
  const file=resolve(root,'.'+new URL(req.url||'/', 'http://localhost').pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return;}
  const target=file===root?resolve(root,'index.html'):file;
  try{const data=await readFile(target);const type=({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff':'font/woff','.woff2':'font/woff2'} as Record<string,string>)[extname(target)]||'application/octet-stream';res.writeHead(200,{'Content-Type':type}).end(data);}catch{res.writeHead(404).end();}
});
server.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));
const origin=`http://127.0.0.1:${(server.address() as {port:number}).port}`;
let browser:Awaited<ReturnType<typeof chromium.launch>>|undefined;
try {
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  for(const manual of [false,true]) {
    const context=await browser.newContext({viewport:{width:manual?360:1440,height:900}}),page=await context.newPage(),counts=new Map<string,number>(),errors:string[]=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',async route=>{
      const path=new URL(route.request().url()).pathname;const count=(counts.get(path)||0)+1;counts.set(path,count);
      if(count===1&&['/api/facilities','/api/auth/me','/api/config'].includes(path)){await route.fulfill({status:502,contentType:'text/html',body:'<html>Render starting</html>'});return;}
      const data=path==='/api/facilities'?[{id:'recovery-unit',name:'Recovery Unit',address:'',announcement:''}]:path==='/api/auth/me'?{user:{id:'recovery-patient',name:'Recovery Patient',email:'recovery@test.local',role:'patient',facility_id:null,can_manage_activities:false},csrf:'test-csrf'}:path==='/api/config'?{demo:false}:{sessionOpen:false,queues:[]};
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(data)});
    });
    await page.goto(origin);
    await expect(page.getByText('Connecting to your Health Unit. The service may be starting up. We’ll keep trying.',{exact:true})).toBeVisible();
    if(manual)await page.getByRole('button',{name:'Retry connection',exact:true}).click();
    await expect(page.getByRole('heading',{name:'Hello, Recovery.',exact:true})).toBeVisible({timeout:15000});
    await expect(page.getByRole('button',{name:'My information',exact:true})).toHaveCount(1);
    expect(counts.get('/api/facilities')).toBe(2);expect(counts.get('/api/auth/me')).toBe(2);
    // The superseded effect's retry timer must not generate another startup read.
    if(manual){await page.waitForTimeout(5500);expect(counts.get('/api/facilities')).toBe(2);expect(counts.get('/api/auth/me')).toBe(2);}
    expect(await page.locator('.alert.error').count()).toBe(0);expect(errors).toEqual([]);
    console.log(`${manual?'Manual mobile':'Automatic desktop'} recovery passed after HTML 502, including authenticated session restoration.`);
    await context.close();
  }
} finally {if(browser)await browser.close();await new Promise<void>(r=>server.close(()=>r()));}
