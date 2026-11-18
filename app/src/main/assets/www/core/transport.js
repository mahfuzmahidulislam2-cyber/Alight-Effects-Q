import {Emitter} from './events.js';
export const fmt=(t,fps=30)=>{
  const s=Math.floor(t),f=Math.floor((t-s)*fps+1e-6),p=n=>String(n).padStart(2,'0');
  return `${p(Math.floor(s/60))}:${p(s%60)}.${p(f)}`;
};
/** Playhead clock. Wall-clock based; emits 'time' and 'state'. */
export class Transport extends Emitter{
  constructor(project){super();this.p=project;this.t=0;this.playing=false;this._raf=0}
  seek(t){this.t=Math.max(0,Math.min(this.p.duration,t));this.emit('time',this.t)}
  play(){
    if(this.playing)return;
    if(this.t>=this.p.duration-1e-3)this.t=0;
    this.playing=true;this._last=performance.now();this.emit('state');
    const tick=now=>{
      if(!this.playing)return;
      const t=this.t+(now-this._last)/1000;this._last=now;
      if(t>=this.p.duration){this.t=this.p.duration;this.pause();this.emit('time',this.t);return}
      this.t=t;this.emit('time',t);this._raf=requestAnimationFrame(tick);
    };
    this._raf=requestAnimationFrame(tick);
  }
  pause(){if(!this.playing)return;this.playing=false;cancelAnimationFrame(this._raf);this.emit('state')}
  toggle(){this.playing?this.pause():this.play()}
}
