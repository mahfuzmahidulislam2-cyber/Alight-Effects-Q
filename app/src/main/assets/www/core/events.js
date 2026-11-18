export class Emitter{
  constructor(){this.h={}}
  on(e,f){(this.h[e]??=[]).push(f);return()=>this.off(e,f)}
  off(e,f){this.h[e]=(this.h[e]||[]).filter(x=>x!==f)}
  emit(e,d){(this.h[e]||[]).slice().forEach(f=>f(d))}
}
