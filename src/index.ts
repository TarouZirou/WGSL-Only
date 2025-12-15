import { getSource } from "./monaco.js";

interface Point {
	x: number;
	y: number;
}

const canvas: HTMLCanvasElement = document.getElementById(
	"canvas",
)! as HTMLCanvasElement;
const buttons: HTMLDivElement = document.getElementById(
	"buttons",
)! as HTMLDivElement;
// ボタンタグを追加する
const runButton: HTMLButtonElement = document.createElement("button");
runButton.textContent = "Run";
buttons.appendChild(runButton);

const saveButton = document.createElement("button");
saveButton.textContent = "Save";
buttons.appendChild(saveButton);

const downloadButton: HTMLButtonElement = document.createElement("button");
downloadButton.textContent = "Download";
buttons.appendChild(downloadButton);

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
buttons.appendChild(clearButton);

// ボタンを押した時に、シェーダーを読んで初期化する
runButton.addEventListener("click", init, true);

saveButton.addEventListener("click", save, true);

downloadButton.addEventListener("click", download, true);

clearButton.addEventListener("click", reset, true);

// エラーを出力する画面
const debugConsole: HTMLDivElement = document.getElementById(
	"console",
)! as HTMLDivElement;

const ctx = canvas.getContext("webgpu") as GPUCanvasContext;
const g_adpt: GPUAdapter =
	(await navigator.gpu.requestAdapter()!) as GPUAdapter;
const g_dev: GPUDevice = await g_adpt.requestDevice();
const vertWGSL: string = await fetch("./wgsl/vert.wgsl").then((r) => r.text());

let WGSL: string;
const presentationFormat: GPUTextureFormat =
	navigator.gpu.getPreferredCanvasFormat();
ctx.configure({
	device: g_dev,
	format: presentationFormat,
	alphaMode: "opaque",
});

let time: number = 0; // [s]
let fps: number = 1000 / 60; // [ms]
let frameError: number = 1; // [ms]

const mouse: Point = {
	x: 0,
	y: 0,
};

canvas.addEventListener("mousemove", (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

//四角形の頂点データ
/* prettier-ignore */
const vertex = new Float32Array([
	-1, 1, 0,
	-1, -1, 0,
	1, -1, 0,
	1, 1, 0,
]);
// prettier-ignore
const idx = new Uint16Array([
	0, 2, 1,
	0, 2, 3
]);

//頂点バッファ
const vertexBuf: GPUBuffer = g_dev.createBuffer({
	size: vertex.byteLength,
	usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});
g_dev.queue.writeBuffer(vertexBuf, 0, vertex);

//インデックスバッファ
const idxBuf: GPUBuffer = g_dev.createBuffer({
	size: idx.byteLength,
	usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});
g_dev.queue.writeBuffer(idxBuf, 0, idx);

//Uniformバッファ
const uniBufSize = 4 * 6;
const uniformBuffer: GPUBuffer = g_dev.createBuffer({
	size: uniBufSize,
	usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

let pipeline: GPURenderPipeline;
let uniformBindGroup: GPUBindGroup;

//cancelAnimationFrameのために、requestAnimationFrameのIDを保存する
let requestID: number;

// WGSLの初期化を行う
export function init() {
	cancelAnimationFrame(requestID);
	mouse.x = canvas.width / 2;
	mouse.y = canvas.height / 2;

	//
	g_dev.pushErrorScope("validation");
	// WGSLの初期化を行う
	WGSL = getSource();
	const WGSLModule = g_dev.createShaderModule({
		code: WGSL,
	});
	g_dev.popErrorScope().then(async (error: GPUError | null) => {
		if (error) {
			const info = await WGSLModule.getCompilationInfo();

			debugConsole!.innerHTML = info.messages
				.map((msg) => msg.message)
				.join("<br>");
		}
	});

	//WebGPUについて、必要な分だけ初期化する
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
	uniformBindGroup = g_dev.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [
			{
				binding: 0,
				resource: {
					buffer: uniformBuffer,
				},
			},
		],
		label: "uni",
	});
	render(ctx);
}

function save() {
	const WGSL = getSource();
	localStorage.setItem("shader", WGSL);
}

function reset() {
	if (confirm("Are you sure to clear?")) {
		localStorage.removeItem("shader");
	}
}

function download() {
	const blob: Blob = new Blob([WGSL], { type: "text/plain" });
	const url: string = URL.createObjectURL(blob);
	const a: HTMLAnchorElement = document.createElement("a");
	a.href = url;
	a.download = "shader.wgsl";
	a.click();
	URL.revokeObjectURL(url);
}

const sTime: number = new Date().getTime(); // [ms]
function render(ctx: GPUCanvasContext) {
	time = (new Date().getTime() - sTime) / 1000; //[s]

	//描画
	const cmdEnc: GPUCommandEncoder = g_dev.createCommandEncoder();
	const texView: GPUTexture = ctx.getCurrentTexture();
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

	// コマンドの開始
	const passEnc: GPURenderPassEncoder = cmdEnc.beginRenderPass(rendPassDesc);

	// バッファに変数を書き込む
	g_dev.queue.writeBuffer(uniformBuffer, 0, new Float32Array([time]));
	g_dev.queue.writeBuffer(
		uniformBuffer,
		4 * 2,
		new Float32Array([mouse.x, mouse.y]),
	);
	g_dev.queue.writeBuffer(
		uniformBuffer,
		4 * 4,
		new Float32Array([canvas.width, canvas.height]),
	);

	// パイプラインを選ぶ
	passEnc.setPipeline(pipeline);
	passEnc.setVertexBuffer(0, vertexBuf);
	passEnc.setIndexBuffer(idxBuf, "uint16");
	passEnc.setBindGroup(0, uniformBindGroup);
	passEnc.drawIndexed(6, 1);
	passEnc.end();

	// コマンドを送信
	g_dev.queue.submit([cmdEnc.finish()]);
	requestID = requestAnimationFrame(() => render(ctx));
}

init();
