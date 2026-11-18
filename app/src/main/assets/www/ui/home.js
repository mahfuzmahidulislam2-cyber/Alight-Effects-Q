import {h,soon} from './dom.js';
import {renderFrame} from '../render/compositor.js';

const thumb=p=>{
  const c=h('canvas',{width:360,height:Math.round(360*p.height/p.width)});
  renderFrame(c.getContext('2d'),p,Math.min(p.duration*.4,2),c.width,c.height,null);
  return c;
};
export function mountHome(root,{projects,onOpen,onNew}){
  const action=(label,stage)=>h('button',{class:'action planned',onclick:()=>soon(label,stage)},label,h('i',{class:'tag'},'soon'));
  root.replaceChildren(h('main',{class:'home'},
    h('header',{class:'brand'},
      h('img',{class:'logo',src:'assets/logo.png',alt:'Alight Effects Q logo',width:112,height:112}),
      h('h1',{},'Alight Effects Q'),
      h('p',{},'Version 1.0 in development. Stage 0: UI foundation.')),
    h('button',{class:'btn-primary',onclick:onNew},'New project'),
    h('div',{class:'actions'},action('Import','Stage 1'),action('Presets','Stage 2'),action('Settings','Stage 1')),
    h('h2',{class:'h2'},'Recent projects'),
    h('div',{class:'cards'},projects.map(p=>h('button',{class:'card',onclick:()=>onOpen(p)},
      thumb(p),
      h('div',{class:'meta'},
        h('b',{},p.name,p.sample&&h('span',{class:'badge'},'sample')),
        h('small',{},`${p.width}×${p.height}, ${+p.duration.toFixed(1)}s, ${p.layers.length} layers`))))),
    h('section',{class:'legend'},
      h('p',{},h('b',{class:'ok'},'Working now: '),'open and create projects, canvas preview, playback clock, timeline scrub and zoom, add, select, edit and delete text and shape layers, layer visibility and track order.'),
      h('p',{},h('b',{class:'pl'},'Not built yet (marked "soon"): '),'media import, trim and split, dragging clips, keyframes, effects, graph editor, audio, export, saving projects. Changes are lost when the app closes.'))
  ));
}
