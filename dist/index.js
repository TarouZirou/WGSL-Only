var s=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(n,c)=>(typeof require<"u"?require:n)[c]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var r;function h(){try{s.config({paths:{vs:"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs"}}),s(["vs/editor/editor.main"],function(){console.log("Monaco Editor loaded"),r=monaco.editor.create(document.getElementById("container"),{value:`// Write your WGSL code here
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
`,language:"wgsl",theme:"vs-dark"}),r.layout(),r.focus(),window.addEventListener("resize",()=>r.layout())})}catch(e){console.error("Error while configuring/using require:",e)}}if(typeof s<"u"&&typeof s.config=="function")h();else{let e="https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js",n=document.createElement("script");n.src=e,n.onload=()=>{console.log("monaco loader.js loaded (dynamic)"),h()},n.onerror=c=>console.error("Failed to load monaco loader dynamically",c),document.head.appendChild(n)}console.log("monaco editor bootstrap finished, editor:",r);var v=()=>r?r.getValue():"";var a=document.getElementById("canvas"),l=document.createElement("button");l.textContent="Initialize";document.getElementById("buttons").appendChild(l);l.addEventListener("click",S,!0);var f=a.getContext("webgpu"),C=await navigator.gpu.requestAdapter(),t=await C.requestDevice(),B=await fetch("./wgsl/vert.wgsl").then(e=>e.text()),q=await fetch("./wgsl/frag.wgsl").then(e=>e.text()),w,m=navigator.gpu.getPreferredCanvasFormat();f.configure({device:t,format:m,alphaMode:"opaque"});var x=0,D=1e3/60,i={x:0,y:0},b=new Float32Array([-1,1,0,-1,-1,0,1,-1,0,1,1,0]),P=new Uint16Array([0,2,1,0,2,3]),g=t.createBuffer({size:b.byteLength,usage:GPUBufferUsage.VERTEX,mappedAtCreation:!0});new Float32Array(g.getMappedRange()).set(b);g.unmap();var p=t.createBuffer({size:P.byteLength,usage:GPUBufferUsage.INDEX,mappedAtCreation:!0});new Uint16Array(p.getMappedRange()).set(P);p.unmap();var L=24,u=t.createBuffer({size:L,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),d=t.createRenderPipeline({layout:"auto",vertex:{module:t.createShaderModule({code:B}),entryPoint:"main",buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:t.createShaderModule({code:q}),entryPoint:"main",targets:[{format:m}]},primitive:{topology:"triangle-list"}}),G=t.createBindGroup({layout:d.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}],label:"uni"});a.addEventListener("mousemove",e=>{i.x=e.clientX,i.y=e.clientY});var U;function S(){cancelAnimationFrame(U),i.x=a.width/2,i.y=a.height/2,w=v();let e=t.createShaderModule({code:w});d=t.createRenderPipeline({layout:"auto",vertex:{module:t.createShaderModule({code:B}),entryPoint:"main",buffers:[{arrayStride:12,attributes:[{shaderLocation:0,offset:0,format:"float32x3"}]}]},fragment:{module:e,entryPoint:"main",targets:[{format:m}]},primitive:{topology:"triangle-list"}}),G=t.createBindGroup({layout:d.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:u}}],label:"uni"}),y(f)}var A=new Date().getTime();function y(e){x=(new Date().getTime()-A)/1e3;let n=t.createCommandEncoder(),E={colorAttachments:[{view:e.getCurrentTexture(),clearValue:{r:0,g:0,b:0,a:1},loadOp:"clear",storeOp:"store"}]},o=n.beginRenderPass(E);t.queue.writeBuffer(u,0,new Float32Array([x])),t.queue.writeBuffer(u,8,new Float32Array([i.x,i.y])),t.queue.writeBuffer(u,16,new Float32Array([a.width,a.height])),o.setPipeline(d),o.setVertexBuffer(0,g),o.setIndexBuffer(p,"uint16"),o.setBindGroup(0,G),o.drawIndexed(6,1),o.end(),t.queue.submit([n.finish()]),U=requestAnimationFrame(()=>y(e))}y(f);export{S as init};
//# sourceMappingURL=index.js.map
