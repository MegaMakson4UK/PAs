const { sin, tan, cos, PI, round, max, min } = Math
const H = 1;
const c = 5;
const alpha = 0.033 * PI
const phi = 0;
const p = 8 * PI
const theta0 = 0;
const uRange = 1;
const vRange = 10;

function CreateSurfaceData2(uStep = 0.02, vStep = 0.2) {
    const uCount = round(uRange / uStep);
    const vCount = round(vRange / vStep);
    let vertexList = [];
    let normalList = [];
    let tangentList = [];
    let bitangentList = [];
    let textureList = [];
    let indices = [];
    const d = 0.01
    for (let u = 0; u <= uRange; u += uStep) {
        for (let v = -5; v <= 5; v += vStep) {
            const p = twiceObliqueTrochoidCylindroid(u, v)
            const pointU = twiceObliqueTrochoidCylindroid(u + d, v);
            const pointV = twiceObliqueTrochoidCylindroid(u, v + d);
            const n = CalculateNormal(pointU, pointV, p)

            vertexList.push(p.x, p.y, p.z)
            normalList.push(...n)
            const t1 = CalculateTangent(pointU, p)
            const bt2 = m4.cross(n, [t1.x, t1.y, t1.z])
            tangentList.push(t1.x, t1.y, t1.z)
            bitangentList.push(bt2.x, bt2.y, bt2.z)
            textureList.push(u, (v + 5) / vRange)
        }
    }
    for (let i = 0; i < vertexList.length / 3 - vCount - 1; i++) {
        indices.push(i)
        indices.push(i + vCount)
        indices.push(i + 1)
        indices.push(i + vCount + 1)
    }

    return [vertexList, indices, normalList, tangentList, bitangentList, textureList];
}
function twiceObliqueTrochoidCylindroid(u, v) {
    const m = 0.3
    const theta = p * u + theta0
    const x = c * u + v * (sin(phi) + tan(alpha) * cos(phi) * cos(theta))
    const y = v * tan(alpha) * sin(theta)
    const z = H + v * (tan(alpha) * sin(phi) * cos(theta) - cos(phi))
    return { x: x * m, y: y * m, z: z * m }
}

function CalculateTangent(p2, p1) {
    const tang = {
        x: (p2.x - p1.x),
        y: (p2.y - p1.y),
        z: (p2.z - p1.z)
    };
    return tang;
}

function CalculateNormal(pointU, pointV, point) {
    const tanU = CalculateTangent(pointU, point)

    const tanV = CalculateTangent(pointV, point)

    return m4.normalize(m4.cross(tanU, tanV))
}

function CreateSphereData() {
    let vertexList = [];
    let normalList = [];
    let textureList = [];
    let indices = [];
    const uStep = 0.1
    const vStep = 0.1
    const uRangeS = PI * 2
    const vRangeS = PI
    const uCount = round(uRangeS / uStep);
    const vCount = round(vRangeS / vStep);
    for (let u = 0; u <= uRangeS; u += uStep) {
        for (let v = 0; v <= vRangeS; v += vStep) {
            const p = getSphereVertex(u, v)
            const p1 = getSphereVertex(u + uStep, v)
            const p2 = getSphereVertex(u, v + vStep)
            const t1 = { x: p1.x - p.x, y: p1.y - p.y, z: p1.z - p.z }
            const t2 = { x: p2.x - p.x, y: p2.y - p.y, z: p2.z - p.z }
            const n = m4.normalize(m4.cross([t1.x, t1.y, t1.z], [t2.x, t2.y, t2.z]))
            vertexList.push(p.x, p.y, p.z)
            normalList.push(...n)
            textureList.push(u / uRangeS, v / vRangeS)
        }
    }
    for (let i = 0; i < vertexList.length / 3 - vCount - 1; i++) {
        indices.push(i)
        indices.push(i + vCount)
        indices.push(i + 1)
        indices.push(i + vCount + 1)
    }
    return [vertexList, indices, normalList, normalList, normalList, textureList];
}

const r = 0.05;
function getSphereVertex(lng, lat) {
    return {
        x: r * Math.cos(lng) * Math.sin(lat),
        y: r * Math.sin(lng) * Math.sin(lat),
        z: r * Math.cos(lat)
    }
}

