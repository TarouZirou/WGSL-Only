var u=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(n,o)=>(typeof require<"u"?require:n)[o]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var a,h=`// Write your WGSL code here
struct Uniforms {
	time: f32,
	aux: f32,
	mouse: vec2<f32>,
	width: f32,
	height: f32,
};
@binding(0) @group(0) var<uniform> u: Uniforms;

@fragment
fn main(
	@builtin(position) pos: vec4<f32>
) -> @location(0) vec4<f32> {
	let pi = 3.1415926535;
	let p = vec4<f32>(pos.x/u.width, pos.y/u.height, 0, 0);

	return vec4<f32>(
		p.xy,
		0.0,
		1.0
	);
}
`;function y(){try{u.config({paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs"}}),u(["vs/editor/editor.main"],function(){console.log("Monaco Editor loaded"),a=monaco.editor.create(document.getElementById("container"),{value:h,language:"wgsl",theme:"vs-dark",fontFamily:"Fira Code, monospace",fontSize:14,fontLigatures:!0}),a.layout(),a.focus(),window.addEventListener("resize",()=>a.layout())})}catch(e){console.error("Error while configuring/using require:",e)}}if(typeof u<"u"&&typeof u.config=="function")y();else{let e="https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js",n=document.createElement("script");n.src=e,n.onload=()=>{console.log("monaco loader.js loaded (dynamic)"),y()},n.onerror=o=>console.error("Failed to load monaco loader dynamically",o),document.head.appendChild(n)}var w=()=>a?a.getValue():h;var i=document.getElementById("canvas"),f=document.createElement("button");f.textContent="Initialize";document.getElementById("buttons").appendChild(f);f.addEventListener("click",b,!0);var q=document.getElementById("console"),m=i.getContext("webgpu"),S=await navigator.gpu.requestAdapter(),t=await S.requestDevice(),A=await fetch("./wgsl/vert.wgsl").then(e=>e.text()),B,P=navigator.gpu.getPreferredCanvasFormat();m.configure({device:t,format:P,alphaMode:"opaque"});var x=0,T=1e3/60,s={x:0,y:0};i.addEventListener("mousemove",e=>{s.x=e.clientX,s.y=e.clientY});var U=new Float32Array([-1,1,0,-1,-1,0,1,-1,0,1,1,0]),G=new Uint16Array([0,2,1,0,2,3]),p=t.createBuffer({size:U.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(p.getMappedRange()).set(U);p.unmap();var g=t.createBuffer({size:G.byteLength,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0});new Uint16Array(g.getMappedRange()).set(G);g.unmap();var L=24,c=t.createBuffer({size:L,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),l,E,C;function b(){cancelAnimationFrame(C),s.x=i.width/2,s.y=i.height/2,t.pushErrorScope("validation"),B=w();let e=t.createShaderModule({code:B});t.popErrorScope().then(async n=>{if(n){let o=await e.getCompilationInfo();q.innerHTML=o.messages.map(d=>d.message).join("<br>")}}),l=t.createRenderPipeline({layout:"auto",vertex:{module:t.createShaderModule({code:A}),entryPoint:"main",buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:e,entryPoint:"main",targets:[{format:P}]},primitive:{topology:"triangle-list"}}),E=t.createBindGroup({layout:l.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:c}}],label:"uni"}),v(m)}var F=new Date().getTime();function v(e){x=(new Date().getTime()-F)/1e3;let n=t.createCommandEncoder(),d={colorAttachments:[{view:e.getCurrentTexture(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]},r=n.beginRenderPass(d);t.queue.writeBuffer(c,0,new Float32Array([x])),t.queue.writeBuffer(c,8,new Float32Array([s.x,s.y])),t.queue.writeBuffer(c,16,new Float32Array([i.width,i.height])),r.setPipeline(l),r.setVertexBuffer(0,p),r.setIndexBuffer(g,"uint16"),r.setBindGroup(0,E),r.drawIndexed(6,1),r.end(),t.queue.submit([n.finish()]),C=requestAnimationFrame(()=>v(e))}b();v(m);export{b as init};
//# sourceMappingURL=index.js.map
