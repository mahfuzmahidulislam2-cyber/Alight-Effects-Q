import {h} from './dom.js';
const MIN=20,MAX=480;
const lab=t=>`${+t.toFixed(2)}s`;
/**
 * Alight-style timeline: the playhead is fixed at the centre and the tracks scroll under it.
 * Scrolling == scrubbing (native touch scrolling, so it stays smooth on low-end phones).
 */
export class TimelineView{
  constructor(project,transport,{onSelect}){
    this.p=project;this.t=transport;this.onSelect=onSelect;this.pps=80;this.pad=0;this.sel=null;this.expected=0;
    this.content=h('div',{class:'tl-content'});
    this.scroll=h('div',{class:'tl-scroll'},this.content);
    this.el=h('div',{class:'tl'},this.scroll,h('div',{class:'playhead'}));
    this.scroll.addEventListener('scroll',()=>{
      const x=this.scroll.scrollLeft;
      if(Math.abs(x-this.expected)<1.5)return;      // our own programmatic scroll
      if(this.t.playing)this.t.pause();
      this.t.seek(x/this.pps);
    },{passive:true});
    this.scroll.addEventListener('touchstart',()=>{if(this.t.playing)this.t.pause()},{passive:true});
    this.off=this.t.on('time',t=>this.sync(t));
    this.ro=new ResizeObserver(()=>{this.pad=this.scroll.clientWidth/2;this.render()});
    this.ro.observe(this.scroll);
  }
  destroy(){this.ro.disconnect();this.off()}
  sync(t){
    const x=t*this.pps;
    if(Math.abs(this.scroll.scrollLeft-x)>=.5)this.scroll.scrollLeft=x;
    this.expected=this.scroll.scrollLeft;
  }
  setSel(id){this.sel=id;this.render()}
  zoom(f){const n=Math.min(MAX,Math.max(MIN,this.pps*f));if(n!==this.pps){this.pps=n;this.render()}}
  render(){
    const {pps,pad,p}=this;if(!pad)return;
    this.content.style.width=(pad*2+p.duration*pps)+'px';
    const ruler=h('div',{class:'ruler'});
    const step=[.1,.25,.5,1,2,5,10,30].find(s=>s*pps>=64)||60;
    for(let k=0;k*step<=p.duration+1e-6;k++)ruler.append(h('div',{class:'tick',style:`left:${pad+k*step*pps}px`},lab(k*step)));
    const lanes=[0,1,2].map(i=>h('div',{class:'lane'},h('span',{class:'lane-label'},i+1)));
    for(const l of p.layers)lanes[l.track].append(h('div',{
      class:`clip ${l.type}${l.id===this.sel?' sel':''}${l.visible?'':' hidden'}`,
      style:`left:${pad+l.start*pps}px;width:${Math.max(8,l.duration*pps)}px`,
      onclick:()=>this.onSelect(l.id===this.sel?null:l.id)},l.name));
    this.content.replaceChildren(ruler,...lanes);
    this.sync(this.t.t);
  }
}
