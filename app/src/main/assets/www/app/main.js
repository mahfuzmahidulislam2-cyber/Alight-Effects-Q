import {Project} from '../core/project.js';
import {createSamples} from '../core/samples.js';
import {mountHome} from '../ui/home.js';
import {mountEditor} from '../ui/editor.js';

const root=document.getElementById('app');
const projects=createSamples();
let editor=null;

function showHome(){editor?.destroy();editor=null;mountHome(root,{projects,onOpen:open,onNew})}
function open(p){history.pushState({v:'editor'},'');editor=mountEditor(root,p,{onExit:()=>history.back()})}
function onNew(){
  const p=new Project({name:`Project ${projects.filter(x=>!x.sample).length+1}`});
  projects.unshift(p);open(p);
}
addEventListener('popstate',showHome);      // Android back button returns to home
history.replaceState({v:'home'},'');
showHome();
if('serviceWorker' in navigator&&!/AEQApp/.test(navigator.userAgent))addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
