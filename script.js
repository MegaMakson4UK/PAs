const { sin, tan, cos, PI, round } = Math
const H = 1;
const c = 5;
const alpha = 0.033 * PI
const phi = 0;
const p = 8 * PI
const theta0 = 0;
const uStep = 0.01
const vStep = 0.5
const uRange = 1;
const vRange = 10;
const uCount = round(uRange / uStep);
const vCount = round(vRange / vStep);
function CreateSurfaceData2() {
    let vertexList = [];
    for (let u = 0; u <= 1; u += uStep) {
        for (let v = -5; v <= 5; v += vStep) {
            const p = twiceObliqueTrochoidCylindroid(u, v)
            vertexList.push(p.x, p.y, p.z)
        }
    }
    for (let v = -5; v <= 5; v += vStep) {
        for (let u = 0; u <= 1; u += uStep) {
            const p = twiceObliqueTrochoidCylindroid(u, v)
            vertexList.push(p.x, p.y, p.z)
        }
    }

    return vertexList;
}
function twiceObliqueTrochoidCylindroid(u, v) {
    const m = 0.2
    const theta = p * u + theta0
    const x = c * u + v * (sin(phi) + tan(alpha) * cos(phi) * cos(theta))
    const y = v * tan(alpha) * sin(theta)
    const z = H + v * (tan(alpha) * sin(phi) * cos(theta) - cos(phi))
    return { x: x * m, y: y * m, z: z * m }
}