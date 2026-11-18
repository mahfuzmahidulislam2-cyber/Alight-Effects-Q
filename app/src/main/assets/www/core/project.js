import {Emitter} from './events.js';
export const TRACKS=3;
let seq=0;
const uid=()=>'l'+Date.now().toString(36)+(++seq);

/** Project model. Track 0 is the top track (drawn on top). Emits 'change' {structural}. */
export class Project extends Emitter{
  constructor(d={}){
    super();
    Object.assign(this,{id:'p'+Date.now().toString(36),name:'Untitled',width:1920,height:1080,fps:30,duration:6,bg:'#000000',layers:[],sample:false},d);
  }
  get(id){return this.layers.find(l=>l.id===id)}
  layersAt(t){return this.layers.filter(l=>l.visible&&t>=l.start&&t<l.start+l.duration).sort((a,b)=>b.track-a.track)}
  freeTrack(start,dur){
    for(let i=0;i<TRACKS;i++)if(!this.layers.some(l=>l.track===i&&l.start<start+dur&&start<l.start+l.duration))return i;
    return 0;
  }
  addLayer(type,start=0,o={}){
    const dur=o.duration||3;
    const base={id:uid(),type,name:type,track:this.freeTrack(start,dur),start,duration:dur,visible:true,
      transform:{x:this.width/2,y:this.height/2,scale:1,rotation:0,opacity:1},props:{}};
    const props=type==='text'?{text:'Text',size:200,color:'#ffffff',weight:800}:{kind:'rect',w:500,h:500,fill:'#e600ff'};
    const l={...base,...o,transform:{...base.transform,...o.transform},props:{...props,...o.props}};
    this.layers.push(l);
    this.duration=Math.max(this.duration,start+dur);
    this.emit('change',{structural:true});
    return l;
  }
  remove(id){this.layers=this.layers.filter(l=>l.id!==id);this.emit('change',{structural:true})}
  patch(id,fn,structural=false){const l=this.get(id);if(!l)return;fn(l);this.emit('change',{structural})}
}
