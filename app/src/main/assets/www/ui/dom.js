export function h(tag,a={},...kids){
  const e=document.createElement(tag);
  for(const [n,v] of Object.entries(a)){
    if(n==='class')e.className=v;
    else if(n==='html')e.innerHTML=v;
    else if(n.startsWith('on'))e.addEventListener(n.slice(2),v);
    else if(v!==false&&v!=null)e.setAttribute(n,v===true?'':v);
  }
  for(const c of kids.flat())if(c!=null&&c!==false)e.append(c.nodeType?c:document.createTextNode(c));
  return e;
}
let tEl,tm;
export function toast(msg){
  if(!tEl){tEl=h('div',{class:'toast',role:'status'});document.body.append(tEl)}
  tEl.textContent=msg;tEl.classList.add('show');clearTimeout(tm);tm=setTimeout(()=>tEl.classList.remove('show'),2400);
}
export const soon=(name,stage)=>toast(`${name}: not implemented yet (planned for ${stage}).`);
