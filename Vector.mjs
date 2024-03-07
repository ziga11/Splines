export function negate(v) {
    return scalar(v, -1);
}

export function add(v, w) {
    let out = [];
    for (let i = 0; i < v.length; i++)
        out[i] = v[i] + w[i];
    return out;
}

export function subtract(v, w) {
    let out = [];
    for (let i = 0; i < v.length; i++)
        out[i] = v[i] - w[i];
    return out;
}

export function multiply(v, w) {
    let out = [];
    for (let i = 0; i < v.length; i++)
        out[i] = v[i] * w[i];
    return out;
}

export function divide(v, w) {
    let out = [];
    for (let i = 0; i < v.length; i++)
        out[i] = v[i] / w[i];
    return out;
}

export function dot(v, w) {
    let out = 0.0;
    for (let i = 0; i < v.length; i++)
        out += v[i] * w[i];
    return out;
}

export function cross(v, w) {
    const out = [0.0, 0.0, 0.0];
    out[0] = (v[1] * w[2]) - (v[2] * w[1]);
    out[1] = (v[2] * w[0]) - (v[0] * w[2]);
    out[2] = (v[0] * w[1]) - (v[1] * w[0]);
    return out;
}

export function length(v) {
    return Math.hypot(...v);
}

export function normalize(v) {
    const len = length(v);
    let out = [];
    for (const vElem of v)
        out.push(vElem / len);
    return out;
}

export function scalar(vector, value) {
    return vector.map(elem => elem * value);
}
export function project(v, w) {
    const wNormalized = normalize(w);
    const vDotW = dot(v, wNormalized);
    return scalar(wNormalized, vDotW);
}

export function reflect(v, w) {
    return subtract(v, scalar(project(v, w), 2));
}

export function angle(v, w) {
    return Math.acos(Math.max(Math.min(dot(normalize(v), normalize(w)), 1), -1));
}
