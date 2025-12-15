let editor;

/**
 * @type {string}
 */
export const initSource =
	localStorage.getItem("shader") ??
	(await fetch("./wgsl/fragment.wgsl").then((r) => r.text()));

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
					value: initSource,
					language: "wgsl",
					theme: "vs-dark",
					fontFamily: "Fira Code, monospace",
					fontSize: 12,
					fontLigatures: true,
				},
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

/**
 *
 * @returns {string}
 */
export const getSource = () => (editor ? editor.getValue() : initSource);
