import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const errors:string[]=[];
const demoName=`Browser Demo Patient ${Date.now()}`;
const context=await browser.newContext({viewport:{width:1440,height:1100}});const page=await context.newPage();
page.on('pageerror',e=>errors.push(e.message));
await mkdir('.local/screenshots',{recursive:true});
try{
  await page.goto('http://localhost:5173');await page.getByRole('heading',{name:'Care, without the uncertainty.'}).waitFor();
  await page.getByRole('button',{name:'Sign in / Register'}).click();await page.getByRole('button',{name:'Administrator',exact:true}).click();
  await page.getByRole('heading',{name:/Good (morning|afternoon), Daniel/}).waitFor();await page.screenshot({path:'.local/screenshots/desktop-dashboard.png',fullPage:true});
  await page.getByRole('button',{name:'Live queues',exact:true}).click();await page.getByRole('heading',{name:'A clear next step, for everyone.'}).waitFor();
  await page.getByRole('button',{name:'Daily QR',exact:true}).click();await page.getByAltText('QR code for today’s patient registration').waitFor();const joinUrl=await page.getByRole('textbox',{name:'Daily registration URL'}).inputValue();await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  for(const [nav,heading] of [['Activities & booking','A little planning. A healthier day.'],['Appointments','Appointments, organized.'],['Service directory','Know before you go.'],['Reports & insights','See what’s making a difference.'],['Administration','Set up better care.']]){
    await page.getByRole('button',{name:nav,exact:true}).click();await page.getByRole('heading',{name:heading,exact:true}).waitFor();await page.waitForTimeout(250);
    if(await page.locator('.alert.error').count())throw new Error(`${nav}: ${await page.locator('.alert.error').allTextContents()}`);
  }
  const f=await page.locator('.facility-switch select').inputValue();const monitor=await context.newPage();await monitor.goto(`http://localhost:5173/?monitor=${f}`);await monitor.getByRole('heading',{name:'Welcome. You’re in the right place.'}).waitFor();await monitor.locator('.monitor-number').first().waitFor();await monitor.screenshot({path:'.local/screenshots/monitor.png',fullPage:true});await monitor.close();
  const mobile=await browser.newContext({viewport:{width:360,height:800},isMobile:true,hasTouch:true});const m=await mobile.newPage();m.on('pageerror',e=>errors.push(e.message));await m.goto(joinUrl);await m.getByRole('button',{name:'Continue as a guest'}).click();await m.getByLabel('Patient’s full name').fill(demoName);await m.getByLabel('Date of birth').fill('1995-05-15');await m.getByLabel('Barangay',{exact:true}).fill('Calvario');await m.locator('input[name="consent"]').check();await m.locator('select[name="queueId"]').selectOption({label:'Triage'});await m.getByRole('button',{name:'Register for arrival confirmation'}).click();await m.getByRole('heading',{name:'You’re registered.'}).waitFor();await m.screenshot({path:'.local/screenshots/mobile-pending.png',fullPage:true});
  if(await m.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth))throw new Error('Mobile layout overflows horizontally.');
  await page.getByRole('button',{name:'Live queues',exact:true}).click();await page.getByText(demoName,{exact:true}).waitFor();const row=page.locator('.arrival-row').filter({hasText:demoName}).first();await row.getByRole('button',{name:'Confirm arrival'}).click();await page.getByRole('button',{name:'Confirm arrival & issue number'}).click();await m.reload();await m.locator('.patient-number').waitFor();await m.screenshot({path:'.local/screenshots/mobile-ticket.png',fullPage:true});
  await mobile.close();
  await page.locator('.assistant-fab').click();await page.getByRole('button',{name:'How do I get a queue number?'}).click();await page.locator('.chat-message.assistant').waitFor();
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Browser checks passed: dashboard, navigation, reports, monitor, 360px guest registration, staff arrival confirmation, patient ticket tracking, assistant. Screenshots: .local/screenshots/');
}finally{await browser.close();}
