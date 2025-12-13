import * as monaco from "monaco-editor";

export const editor = monaco.editor.create(
	document.getElementById("container")!,
	{
		value: `// Write your WGSL code here
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


`,
		language: "wgsl",
		theme: "vs-dark",
	},
);

export const getSource = () => editor.getValue();
