/** Canvas 2D compositor. A pure function of (project, time) drawing into the ctx it is given. */
const font=(ctx,p)=>{ctx.font=`${p.weight} ${p.size}px system-ui,Roboto,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle'};
function bounds(ctx,l){const p=l.props;if(l.type==='shape')return{w:p.w,h:p.h};font(ctx,p);return{w:ctx.measureText(p.text).width,h:p.size*1.2}}
function drawLayer(ctx,l){
  const p=l.props;
  if(l.type==='shape'){
    ctx.fillStyle=p.fill;
    if(p.kind==='ellipse'){ctx.beginPath();ctx.ellipse(0,0,p.w/2,p.h/2,0,0,Math.PI*2);ctx.fill()}
    else ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
  }else if(l.type==='text'){font(ctx,p);ctx.fillStyle=p.color;ctx.fillText(p.text,0,0)}
}
export function renderFrame(ctx,project,t,W,H,selId=null){
  const s=W/project.width;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
  ctx.fillStyle=project.bg;ctx.fillRect(0,0,W,H);
  for(const l of project.layersAt(t)){
    const tf=l.transform,k=s*tf.scale;
    ctx.save();
    ctx.setTransform(s,0,0,s,0,0);
    ctx.translate(tf.x,tf.y);ctx.rotate(tf.rotation*Math.PI/180);ctx.scale(tf.scale,tf.scale);
    ctx.globalAlpha=tf.opacity;
    drawLayer(ctx,l);
    if(l.id===selId){
      const b=bounds(ctx,l);
      ctx.globalAlpha=1;ctx.strokeStyle='#fff';ctx.lineWidth=3/k;ctx.setLineDash([10/k,6/k]);
      ctx.strokeRect(-b.w/2,-b.h/2,b.w,b.h);
    }
    ctx.restore();
  }
}
