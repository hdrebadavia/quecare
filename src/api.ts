let csrf='';
export function setCsrf(value:string){csrf=value;}
export async function api<T=any>(path:string,method='GET',body?:unknown):Promise<T>{
  const isForm=body instanceof FormData;
  const response=await fetch(`/api${path}`,{method,credentials:'same-origin',headers:{...(isForm?{}:{'Content-Type':'application/json'}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(method==='POST'&&path.includes('/actions')?{'Idempotency-Key':crypto.randomUUID()}:{})},...(body!==undefined?{body:isForm?body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>({error:'The service is unavailable. Please check your connection.'}));if(!response.ok)throw new Error(data.error||'Request failed.');return data;
}
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const time=(date:string)=>new Date(date).toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'});
export const dateLabel=(date:string)=>new Date(date.length===10?`${date}T12:00:00+08:00`:date).toLocaleDateString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric'});
export const num=(n:number)=>String(n).padStart(3,'0');
