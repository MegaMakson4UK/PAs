const { sin, tan, cos, PI, round } = Math
const H = 1;
const c = 5;
const alpha = 0.033 * PI
const phi = 0;
const p = 8 * PI
const theta0 = 0;

const uRange = 1;
const vRange = 10;

function CreateSurfaceData2(uStep = 0.02, vStep = 0.2) {
    // const uStep = 0.02
    // const vStep = 0.2
    const uCount = round(uRange / uStep);
    const vCount = round(vRange / vStep);
    let vertexList = [];
    let normalList = [];
    let indices = [];
    for (let u = 0; u <= 1; u += uStep) {
        for (let v = -5; v <= 5; v += vStep) {
            const p = twiceObliqueTrochoidCylindroid(u, v)
            const p1 = twiceObliqueTrochoidCylindroid(u + uStep, v)
            const p2 = twiceObliqueTrochoidCylindroid(u, v + vStep)
            const t1 = { x: p1.x - p.x, y: p1.y - p.y, z: p1.z - p.z }
            const t2 = { x: p2.x - p.x, y: p2.y - p.y, z: p2.z - p.z }
            const n = m4.normalize(m4.cross([t1.x, t1.y, t1.z], [t2.x, t2.y, t2.z]))
            vertexList.push(p.x, p.y, p.z)
            normalList.push(...n)
        }
    }
    // TRIANGLES
    // for (let i = 0; i < vertexList.length / 3 - vCount - 1; i++) {
    //     indices.push(i)
    //     indices.push(i + 1)
    //     indices.push(i + vCount + 1)
    //     indices.push(i + vCount + 1)
    //     indices.push(i)
    //     indices.push(i + vCount)
    // }
    // TRIANGLE_STRIP
    for (let i = 0; i < vertexList.length / 3 - vCount - 1; i++) {
        indices.push(i)
        indices.push(i + vCount)
        indices.push(i + 1)
        indices.push(i + vCount + 1)
    }
    // for (let v = -5; v <= 5; v += vStep) {
    //     for (let u = 0; u <= 1; u += uStep) {
    //         const p = twiceObliqueTrochoidCylindroid(u, v)
    //         vertexList.push(p.x, p.y, p.z)
    //     }
    // }

    return [vertexList, indices, normalList];
}
function twiceObliqueTrochoidCylindroid(u, v) {
    const m = 0.3
    const theta = p * u + theta0
    const x = c * u + v * (sin(phi) + tan(alpha) * cos(phi) * cos(theta))
    const y = v * tan(alpha) * sin(theta)
    const z = H + v * (tan(alpha) * sin(phi) * cos(theta) - cos(phi))
    return { x: x * m, y: y * m, z: z * m }
}