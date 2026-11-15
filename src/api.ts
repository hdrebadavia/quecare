let csrf='';
export function setCsrf(value:string){csrf=value;}
export class ApiError extends Error {
  constructor(message:string, public status:number, public retryable:boolean, public fieldErrors:Record<string,string>={}) { super(message); }
}
const unavailable='The health service is starting or temporarily unavailable. We’ll reconnect automatically.';
export async function api<T=any>(path:string,method='GET',body?:unknown):Promise<T>{
  const isForm=body instanceof FormData;
  let response:Response;
  try {
    response=await fetch(`/api${path}`,{method,credentials:'same-origin',headers:{...(isForm?{}:{'Content-Type':'application/json'}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(method==='POST'&&path.includes('/actions')?{'Idempotency-Key':crypto.randomUUID()}: {})},...(body!==undefined?{body:isForm?body:JSON.stringify(body)}:{})});
  } catch { throw new ApiError(unavailable,0,true); }
  let data:any;
  try { data=await response.json(); }
  catch { throw new ApiError(unavailable,response.status,response.ok||[502,503,504].includes(response.status)); }
  if(!response.ok) throw new ApiError(data.error||'Request failed.',response.status,[502,503,504].includes(response.status),data.fieldErrors||{});
  return data;
}
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const time=(date:string)=>new Date(date).toLocaleTimeString('en-PH',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit'});
export const dateLabel=(date:string)=>new Date(date.length===10?`${date}T12:00:00+08:00`:date).toLocaleDateString('en-PH',{timeZone:'Asia/Manila',month:'short',day:'numeric',year:'numeric'});
export const num=(n:number)=>String(n).padStart(3,'0');
