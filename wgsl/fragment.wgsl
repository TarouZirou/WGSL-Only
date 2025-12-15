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
	let p = vec2<f32>(pos.x / u.width, pos.y / u.height);

	return vec4<f32>(p, 0.0, 1.0);
}
