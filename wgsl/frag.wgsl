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

	return vec4<f32>((sin(p.x*pi)+1)/2, (sin(p.y*pi)+1)/2, (sin(u.time*3.141592)+1.0)/2, 1.0);
}

