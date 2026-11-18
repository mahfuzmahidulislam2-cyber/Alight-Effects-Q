import {Project} from './project.js';
/** Sample projects (generated in memory, clearly marked as samples). */
export function createSamples(){
  const a=new Project({name:'Neon Intro',sample:true,duration:6,bg:'#12001f'});
  a.addLayer('shape',0,{name:'Glow disc',duration:6,track:2,props:{kind:'ellipse',w:900,h:900,fill:'#4b0082'},transform:{opacity:.85}});
  a.addLayer('shape',1,{name:'Accent bar',duration:4,track:1,props:{w:900,h:18,fill:'#e600ff'},transform:{y:640}});
  a.addLayer('text',.5,{name:'Title',duration:5,track:0,props:{text:'ALIGHT EFFECTS Q',size:150,weight:900}});

  const b=new Project({name:'Lyric Edit Test',sample:true,duration:8,bg:'#101014'});
  b.addLayer('shape',0,{name:'Backdrop',duration:8,track:2,props:{w:1920,h:1080,fill:'#1d1033'}});
  ['Line one','Line two','Line three','Line four'].forEach((s,i)=>
    b.addLayer('text',i*2,{name:s,duration:2,track:i%2,props:{text:s,size:170,color:i%2?'#ff4df0':'#ffffff'}}));

  const c=new Project({name:'Shape Study',sample:true,duration:5,bg:'#0b0b0f'});
  [['#e600ff',640,'rect'],['#7a2cff',960,'ellipse'],['#ff4df0',1280,'rect']].forEach(([fill,x,kind],i)=>
    c.addLayer('shape',i*.8,{name:`${kind} ${i+1}`,duration:4-i*.5,track:i,props:{kind,w:420,h:420,fill},transform:{x,rotation:i*15}}));
  return [a,b,c];
}
