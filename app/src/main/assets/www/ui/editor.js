import {h,toast,soon} from './dom.js';
import {I} from './icons.js';
import {Transport,fmt} from '../core/transport.js';
import {TRACKS} from '../core/project.js';
import {renderFrame} from '../render/compositor.js';
import {TimelineView} from './timelineView.js';

const ib=(icon,label,fn,cls='')=>h('button',{class:`ib ${cls}`,'aria-label':label,html:icon,onclick:fn});
const pct=v=>Math.round(v*100)+'%';

export function mountEditor(root,project,{onExit}){
  const tr=new Transport(project);
  let sel=null,sheet=null,raf=0;

  // --- preview ---
  const canvas=h('canvas'),ctx=canvas.getContext('2d');
  const stage=h('section',{class:'stage'},canvas);
  const draw=()=>{raf=0;renderFrame(ctx,project,tr.t,canvas.width,canvas.height,sel)};
  const redraw=()=>{raf||(raf=requestAnimationFrame(draw))};
  const ro=new ResizeObserver(()=>{
    const r=stage.getBoundingClientRect(),m=16,aw=r.width-m*2,ah=r.height-m*2,ar=project.width/project.height;
    let w=aw,hh=aw/ar;if(hh>ah){hh=ah;w=ah*ar}
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.style.width=w+'px';canvas.style.height=hh+'px';
    canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(hh*dpr));
    draw();
  });

  // --- top bar ---
  const top=h('header',{class:'topbar'},
    ib(I.back,'Back to home',onExit),
    h('div',{class:'title'},project.name,project.sample&&h('span',{class:'badge'},'sample')),
    h('button',{class:'chip planned',onclick:()=>soon('Export','Stage 6')},'Export'));

  // --- transport ---
  const timeEl=h('span',{class:'time'});
  const playBtn=h('button',{class:'ib big',onclick:()=>tr.toggle()});
  const updateTime=()=>{timeEl.textContent=`${fmt(tr.t,project.fps)} / ${fmt(project.duration,project.fps)}`};
  const updatePlay=()=>{playBtn.innerHTML=tr.playing?I.pause:I.play;playBtn.setAttribute('aria-label',tr.playing?'Pause':'Play')};
  const tl=new TimelineView(project,tr,{onSelect:id=>select(id)});
  const transport=h('section',{class:'transport'},timeEl,
    h('div',{class:'tctl'},
      ib(I.prev,'Go to start',()=>{tr.pause();tr.seek(0)}),playBtn,
      ib(I.next,'Go to end',()=>{tr.pause();tr.seek(project.duration)})),
    h('div',{class:'tctl'},ib(I.minus,'Zoom timeline out',()=>tl.zoom(1/1.5)),ib(I.plus,'Zoom timeline in',()=>tl.zoom(1.5))));

  // --- layer bar ---
  const bar=h('section',{class:'layerbar'});
  const moveTrack=(l,d)=>{
    const n=l.track+d;
    if(n<0||n>=TRACKS)return toast(`Already on the ${d<0?'top':'bottom'} track.`);
    project.patch(l.id,x=>{x.track=n},true);
  };
  function updateBar(){
    const l=sel&&project.get(sel);
    if(!l){bar.replaceChildren(h('span',{class:'hint'},'Tap a clip to select a layer.'));return}
    bar.replaceChildren(
      h('span',{class:'lname'},l.name),
      ib(l.visible?I.eye:I.eyeoff,l.visible?'Hide layer':'Show layer',()=>project.patch(l.id,x=>{x.visible=!x.visible},true)),
      ib(I.up,'Move to track above',()=>moveTrack(l,-1)),
      ib(I.down,'Move to track below',()=>moveTrack(l,1)),
      ib(I.trash,'Delete layer',()=>{project.remove(l.id);select(null)}),
      h('button',{class:'chip planned',onclick:()=>soon('Split and trim','Stage 1')},'Split'));
  }
  function select(id){sel=id;tl.setSel(id);updateBar();if(sheet==='props')renderSheet();redraw()}

  // --- bottom sheet ---
  const sheetEl=h('div',{class:'sheet',hidden:true});
  const tile=(icon,label,fn,planned)=>h('button',{class:'tool'+(planned?' planned':''),onclick:fn},h('span',{html:icon}),h('span',{},label),planned&&h('i',{class:'tag'},'soon'));
  function addBody(){
    const add=(type,name,props)=>{
      const start=Math.round(tr.t*project.fps)/project.fps;
      const l=project.addLayer(type,start,{name,props});
      sheet=null;renderSheet();select(l.id);
    };
    return h('div',{class:'grid4'},
      tile(I.text,'Text',()=>add('text','Text')),
      tile(I.shape,'Rectangle',()=>add('shape','Rectangle')),
      tile(I.circle,'Ellipse',()=>add('shape','Ellipse',{kind:'ellipse'})),
      tile(I.media,'Media',()=>soon('Media import','Stage 1'),true));
  }
  function propsBody(){
    const l=sel&&project.get(sel);
    if(!l)return h('p',{class:'hint'},'Select a layer first.');
    const row=(label,min,max,step,get,set,show)=>{
      const out=h('output',{},show(get()));
      return h('label',{class:'row'},h('span',{},label),
        h('input',{type:'range',min,max,step,value:get(),oninput:e=>{const v=+e.target.value;project.patch(l.id,x=>set(x,v));out.textContent=show(v)}}),out);
    };
    const key=l.type==='text'?'color':'fill';
    return h('div',{},
      row('Opacity',0,1,.01,()=>l.transform.opacity,(x,v)=>{x.transform.opacity=v},pct),
      row('Scale',.1,3,.01,()=>l.transform.scale,(x,v)=>{x.transform.scale=v},pct),
      row('Rotation',-180,180,1,()=>l.transform.rotation,(x,v)=>{x.transform.rotation=v},v=>v+'°'),
      row('X',0,project.width,1,()=>l.transform.x,(x,v)=>{x.transform.x=v},v=>Math.round(v)),
      row('Y',0,project.height,1,()=>l.transform.y,(x,v)=>{x.transform.y=v},v=>Math.round(v)),
      h('div',{class:'swatches'},['#ffffff','#e600ff','#ff4df0','#7a2cff','#3a4fb0','#3ddc97','#ffb84d','#000000'].map(c=>
        h('button',{class:'sw','aria-label':'Colour '+c,style:`background:${c}`,onclick:()=>project.patch(l.id,x=>{x.props[key]=c})}))),
      h('div',{class:'row2'},
        h('label',{},'Colour ',h('input',{type:'color',value:l.props[key],oninput:e=>project.patch(l.id,x=>{x.props[key]=e.target.value})})),
        l.type==='text'&&h('button',{class:'chip',onclick:()=>{
          const v=prompt('Text',l.props.text);
          if(v)project.patch(l.id,x=>{x.props.text=v;x.name=v.slice(0,24)},true);
        }},'Edit text')));
  }
  function renderSheet(){
    if(!sheet){sheetEl.hidden=true;return}
    sheetEl.hidden=false;
    sheetEl.replaceChildren(
      h('div',{class:'sh-head'},h('b',{},sheet==='add'?'Add layer':'Properties'),h('button',{class:'chip',onclick:()=>{sheet=null;renderSheet()}},'Done')),
      sheet==='add'?addBody():propsBody());
  }
  const open=m=>{
    if(m==='props'&&!sel)return toast('Select a layer first.');
    sheet=m;renderSheet();
  };

  // --- toolbar ---
  const tool=(icon,label,fn,planned)=>h('button',{class:'tool'+(planned?' planned':''),onclick:fn},h('span',{html:icon}),h('span',{},label),planned&&h('i',{class:'tag'},'soon'));
  const toolbar=h('nav',{class:'toolbar'},
    tool(I.plus,'Add',()=>open('add')),
    tool(I.sliders,'Edit',()=>open('props')),
    tool(I.fx,'Effects',()=>soon('Effects','Stage 3'),true),
    tool(I.key,'Keyframes',()=>soon('Keyframes','Stage 1'),true),
    tool(I.graph,'Graph',()=>soon('Graph editor','Stage 2'),true),
    tool(I.audio,'Audio',()=>soon('Audio','a later stage'),true));

  // --- wiring ---
  const offTime=tr.on('time',()=>{tr.playing?draw():redraw();updateTime()});
  tr.on('state',updatePlay);
  const offChange=project.on('change',e=>{
    redraw();updateTime();
    if(e.structural){tl.render();updateBar();if(sheet==='props')renderSheet()}
  });
  root.replaceChildren(h('div',{class:'editor'},top,stage,transport,tl.el,bar,toolbar,sheetEl));
  ro.observe(stage);updateTime();updatePlay();updateBar();

  return{destroy(){tr.pause();offTime();offChange();ro.disconnect();tl.destroy();cancelAnimationFrame(raf)}};
}
