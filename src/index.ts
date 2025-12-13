import { getSource } from "./monaco.js";

const canvas = document.getElementById("canvas")! as HTMLCanvasElement;

// ボタンタグを追加する
const initButton = document.createElement("button");
initButton.textContent = "Initialize";
document.getElementById("buttons")!.appendChild(initButton);
initButton.addEventListener("click", init, true);

const ctx = canvas.getContext("webgpu") as GPUCanvasContext;
const g_adpt = await navigator.gpu.requestAdapter();
const g_dev = await g_adpt!.requestDevice();
const vertWGSL = await fetch("./wgsl/vert.wgsl").then((r) => r.text());
const fragWGSL = await fetch("./wgsl/frag.wgsl").then((r) => r.text());
let WGSL: string;
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
ctx.configure({
	device: g_dev,
	format: presentationFormat,
	alphaMode: "opaque",
});

let time = 0;
let fps = 1000 / 60;

const mouse = {
	x: 0,
	y: 0,
};

//四角形の頂点データ
/* prettier-ignore */
const vertex = new Float32Array([
	-1, 1, 0,
	-1, -1, 0,
	1, -1, 0,
	1, 1, 0,
]);
const idx = new Uint16Array([0, 2, 1, 0, 2, 3]);

//頂点バッファ
const vertexBuf = g_dev.createBuffer({
	size: vertex.byteLength,
	usage: GPUBufferUsage.VERTEX,
	mappedAtCreation: true,
});
new Float32Array(vertexBuf.getMappedRange()).set(vertex);
vertexBuf.unmap();
const idxBuf = g_dev.createBuffer({
	size: idx.byteLength,
	usage: GPUBufferUsage.INDEX,
	mappedAtCreation: true,
});
new Uint16Array(idxBuf.getMappedRange()).set(idx);
idxBuf.unmap();

//Uniformバッファ
const uniBufSize = 4 * 6;
const uniBuf = g_dev.createBuffer({
	size: uniBufSize,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

let pipeline: GPURenderPipeline = g_dev.createRenderPipeline({
	layout: "auto",
	vertex: {
		module: g_dev.createShaderModule({
			code: vertWGSL,
		}),
		entryPoint: "main",
		buffers: [
			{
				arrayStride: 4 * 3,
				attributes: [
					{
						shaderLocation: 0,
						offset: 0,
						format: "float32x3",
					},
				],
			},
		],
	},
	fragment: {
		module: g_dev.createShaderModule({
			code: fragWGSL,
		}),
		entryPoint: "main",
		targets: [
			{
				format: presentationFormat,
			},
		],
	},
	primitive: {
		topology: "triangle-list",
	},
});
let uniBindGroup = g_dev.createBindGroup({
	layout: pipeline.getBindGroupLayout(0),
	entries: [
		{
			binding: 0,
			resource: {
				buffer: uniBuf,
			},
		},
	],
	label: "uni",
});

canvas.addEventListener("mousemove", (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

let requestID: number;

// WGSLの初期化を行う
export function init() {
	cancelAnimationFrame(requestID);
	mouse.x = canvas.width / 2;
	mouse.y = canvas.height / 2;
	WGSL = getSource();
	const WGSLModule = g_dev.createShaderModule({
		code: WGSL,
	});
	pipeline = g_dev.createRenderPipeline({
		layout: "auto",
		vertex: {
			module: g_dev.createShaderModule({
				code: vertWGSL,
			}),
			entryPoint: "main",
			buffers: [
				{
					arrayStride: 4 * 3,
					attributes: [
						{
							shaderLocation: 0,
							offset: 0,
							format: "float32x3",
						},
					],
				},
			],
		},
		fragment: {
			module: WGSLModule,
			entryPoint: "main",
			targets: [
				{
					format: presentationFormat,
				},
			],
		},
		primitive: {
			topology: "triangle-list",
		},
	});
	uniBindGroup = g_dev.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [
			{
				binding: 0,
				resource: {
					buffer: uniBuf,
				},
			},
		],
		label: "uni",
	});
	render(ctx);
}

const sTime = new Date().getTime();
function render(ctx: GPUCanvasContext) {
	time = (new Date().getTime() - sTime) / 1000;

	//描画
	const cmdEnc = g_dev.createCommandEncoder();
	const texView = ctx.getCurrentTexture();
	const rendPassDesc: GPURenderPassDescriptor = {
		colorAttachments: [
			{
				view: texView,
				clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
				loadOp: "clear",
				storeOp: "store",
			},
		],
	};
	const passEnc = cmdEnc.beginRenderPass(rendPassDesc);
	g_dev.queue.writeBuffer(uniBuf, 0, new Float32Array([time]));
	g_dev.queue.writeBuffer(
		uniBuf,
		4 * 2,
		new Float32Array([mouse.x, mouse.y]),
	);
	g_dev.queue.writeBuffer(
		uniBuf,
		4 * 4,
		new Float32Array([canvas.width, canvas.height]),
	);
	passEnc.setPipeline(pipeline);
	passEnc.setVertexBuffer(0, vertexBuf);
	passEnc.setIndexBuffer(idxBuf, "uint16");
	passEnc.setBindGroup(0, uniBindGroup);
	passEnc.drawIndexed(6, 1);
	passEnc.end();
	g_dev.queue.submit([cmdEnc.finish()]);
	requestID = requestAnimationFrame(() => render(ctx));
}
render(ctx);
