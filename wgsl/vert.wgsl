struct VertexOutput {
    @builtin(position) pos: vec4<f32>,
};

@vertex
fn main(
    @location(0) position: vec3<f32>,
) -> VertexOutput {
    var out : VertexOutput;
    out.pos = vec4<f32>(position, 1.0);
    return out;
}
