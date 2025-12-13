let editor;

function setupRequireAndCreate() {
	try {
		require.config({
			paths: {
				vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs",
			},
		});
		require(["vs/editor/editor.main"], function () {
			console.log("Monaco Editor loaded");
			editor = monaco.editor.create(
				document.getElementById("container"),
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
				}
			);
			// Ensure layout and focus so editor is interactive
			editor.layout();
			editor.focus();
			window.addEventListener("resize", () => editor.layout());
		});
	} catch (ex) {
		console.error("Error while configuring/using require:", ex);
	}
}

// If AMD `require` is already present (loader.js loaded via script tag), use it.
if (typeof require !== "undefined" && typeof require.config === "function") {
	setupRequireAndCreate();
} else {
	// Otherwise, dynamically inject the AMD loader script and then setup
	const loaderUrl =
		"https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs/loader.js";
	const s = document.createElement("script");
	s.src = loaderUrl;
	s.onload = () => {
		console.log("monaco loader.js loaded (dynamic)");
		setupRequireAndCreate();
	};
	s.onerror = (e) =>
		console.error("Failed to load monaco loader dynamically", e);
	document.head.appendChild(s);
}

console.log("monaco editor bootstrap finished, editor:", editor);

export const getSource = () => (editor ? editor.getValue() : "");
