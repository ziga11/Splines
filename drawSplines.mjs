import {Spline} from "./Spline.mjs";
import {Bezier} from "./Bezier.mjs";
import * as vec from "./Vector.mjs"

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const Button = document.getElementById("EndSpline");
const DrawColor = document.getElementById("Draw");
const DeleteButton = document.getElementById("Delete");

let width = window.innerWidth;
let height = window.innerHeight;

canvas.width = width;
canvas.height = height;

let offX = canvas.getBoundingClientRect().left, offY = canvas.getBoundingClientRect().top;

let splineInd = 0;

let SplineList = [{points: [], beziers: [], color: "black"}];

let drawClicked = false;

let mousePoint;
let selectedIndex = null;


canvas.addEventListener("mousemove", (e) => {
    mousePoint = [e.clientX - offX, e.clientY - offY]
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedIndex !== null)
        PointSet(...mousePoint);

    for (let i = 0; i < SplineList.length; i++) {
        DrawPoints(SplineList[i].points, SplineList[i].beziers);
        DrawSpline(SplineList[i].points, SplineList[i].beziers, i);
    }
    ApproxLineDraw();
});

window.addEventListener("resize", () => {
    const BB = canvas.getBoundingClientRect();
    offX = BB.left;
    offY = BB.top;
})

canvas.addEventListener("pointerdown", (event) => {
    if (event.button === 1) {
        event.preventDefault();

        splineInd = ClosestSpline([event.clientX - offX, event.clientY - offY]);

        SplineList[splineInd].color = DrawColor.value;
    }
    else {
        const pointInCircle = ((x, y, cx, cy, radius) => {
            const distanceSquared = ((x - cx) * (x - cx)) + ((y - cy) * (y - cy));

            return distanceSquared <= radius * radius;
        });

        for (let j = 0; j < SplineList.length; j++) {
            for (let i = 0; i < SplineList[j].points.length; i++) {
                if (pointInCircle(event.clientX - offX, event.clientY - offY, SplineList[j].points[i][0], SplineList[j].points[i][1], 15)) {
                    selectedIndex = i;

                    splineInd = j;
                    break;
                }
            }
        }
        PointCreation(event.clientX - offX, event.clientY - offY);
    }
});

Button.addEventListener("click", () => {
    SplineList.push({points: [], beziers: [], color: DrawColor.value});
    splineInd = SplineList.length - 1;
})

canvas.addEventListener("mouseup", () => {
    selectedIndex = null;
    if (drawClicked) {
        SplineList[splineInd].color = DrawColor.value;
        drawClicked = false;
    }
});

DrawColor.addEventListener("click", () => {drawClicked = true});

DeleteButton.addEventListener("click", () => {
    if (SplineList.length === 0)
        return;

    SplineList.splice(splineInd, 1);

    if (SplineList.length === 0) {
        SplineList.push({points: [], beziers: [], color: DrawColor.value})
        splineInd = 0;
    }
    else
        splineInd = SplineList.length - 1;
})


function ClosestSpline(point) {
    if (SplineList.length === 0)
        return 0;
    let closest = Infinity;
    let ind = 0;
    let splines = SplineList.map(e => new Spline(e.beziers));
    for (let i = 0; i < splines.length; i++) {
        for (let j = 0; j < splines[i].curves.length; j++) {
            const part1 = splines[i].curves[j].value(j);
            const part2 = splines[i].curves[j].value(j + 0.25);
            const part3 = splines[i].curves[j].value(j + 0.5);
            const part4 = splines[i].curves[j].value(j + 0.75);

            const dist1 = distanceSquared(point, part1);
            const dist2 = distanceSquared(point, part2);
            const dist3 = distanceSquared(point, part3);
            const dist4 = distanceSquared(point, part4);

            if (dist1 < closest) {
                closest = dist1;
                ind = i;
            }
            if (dist2 < closest) {
                closest = dist2;
                ind = i;
            }
            if (dist3 < closest) {
                closest = dist3;
                ind = i;
            }
            if (dist4 < closest) {
                closest = dist4;
                ind = i;
            }
        }
    }
    return ind;
}
function distanceSquared(p1, p2) {
    const dx = p1[0] - p2[0];
    const dy = p1[1] - p2[1];

    return dx * dx + dy * dy;
}
function PointSet(x, y) {
    SplineList[splineInd].points[selectedIndex][0] = x;
    SplineList[splineInd].points[selectedIndex][1] = y;

    RemakeBeziers();
}

function PointCreation(x, y) {
    if (selectedIndex !== null)
        return;

    let points = SplineList[splineInd].points;
    let beziers = SplineList[splineInd].beziers;
    SplineList[splineInd].points.push([x, y]);
    const pLen = points.length;

    if (pLen > 3 && ((pLen - (beziers.length * 4 - (beziers.length - 1)) === 1))) {
        const prevPoints = beziers[beziers.length - 1].points;
        const ApproxPoint = vec.subtract(vec.scalar(prevPoints[2], 2), prevPoints[1]);

        SplineList[splineInd].points.push([ApproxPoint[0], ApproxPoint[1]]);

        [points[pLen - 1], points[pLen]] = [points[pLen], points[pLen - 1]];
    }
    else if (pLen - (beziers.length * 4 - (beziers.length - 1)) === 3 || pLen === 4) {
        [points[pLen - 2], points[pLen - 1]] = [points[pLen - 1], points[pLen - 2]];

        CreateBezier();
    }
}

function CreateBezier() {
    const points = SplineList[splineInd].points;
    if (points.length > 1 && points.length < 4) {
        SplineList[splineInd].beziers.push(new Bezier([points[0], points[1]]));

        return;
    }

    const startPoint = points.length - 4;
    const p1 = points[startPoint];
    const p2 = points[startPoint + 1];
    const p3 = points[startPoint + 2];
    const p4 = points[startPoint + 3];

    SplineList[splineInd].beziers.push(new Bezier([p1, p2, p3, p4]));
}

function RemakeBeziers() {
    const points = SplineList[splineInd].points;
    if (points.length < 4)
        return;

    SplineList[splineInd].beziers = [];

    for (let i = 0; i < points.length - 3; i += 3) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2];
        const p4 = points[i + 3];

        const bezier = new Bezier([p1, p2, p3, p4]);

        SplineList[splineInd].beziers.push(bezier);
    }
}

function DrawCircle(point) {
    ctx.beginPath();
    ctx.fillStyle = document.getElementById("Control").value;
    ctx.strokeStyle = document.getElementById("Control").value;
    ctx.arc(point[0], point[1], 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

function DrawSquare(point) {
    ctx.beginPath();
    ctx.fillStyle = document.getElementById("Approximate").value;
    ctx.strokeStyle = document.getElementById("Approximate").value;
    ctx.rect(point[0] - 3, point[1] - 3, 6, 6);
    ctx.fill();
    ctx.stroke();
}

function DrawPoints(points, beziers) {
    if (points.length < 4)
        points.map(e => DrawCircle(e));
    else {
        for (const bezier of beziers) {
            DrawCircle(bezier.points[0]);
            DrawSquare(bezier.points[1]);
            DrawSquare(bezier.points[2]);
        }
        DrawCircle(beziers[beziers.length - 1].points[3]);

        for (let i = beziers.length * 4 - (beziers.length); i < points.length; i++)
            i % 2 === 0 ? DrawSquare(points[i]) : DrawCircle(points[i]);
    }
}

function DrawSpline(points, beziers, index) {
    if (points.length < 2)
        return;

    ctx.moveTo(...points[0]);

    if (index === splineInd)
        ctx.lineWidth = 3;
    else
        ctx.lineWidth = 1;

    ctx.strokeStyle = SplineList[index].color;
    ctx.fillStyle = SplineList[index].color;

    ctx.setLineDash([]);

    ctx.beginPath();

    if (points.length < 4) {
        /* Clueless as to why this works and lineTo doesn't */
        ctx.quadraticCurveTo(...points[0], ...points[1]);
        ctx.stroke();
        return;
    }

    const spline = new Spline(beziers);

    spline.makeContinuous();
    spline.makeSmooth();

    let prevDer = spline.curves[0].derivative(0);

    if (points.length === 2) {
        ctx.lineTo(...spline.value(1));
        ctx.stroke();

        return;
    }

    for (let i = 0; i < spline.curves.length; i++) {
        const currDer = spline.curves[i].derivative(1);

        const interPoints = (Math.abs(prevDer[0] - currDer[0]) + Math.abs(prevDer[1] - currDer[1])) / 10;

        let currPoint;

        for (let j = 1; j <= interPoints; j++) {
            currPoint = spline.value(i + (j / interPoints));
            ctx.lineTo(...currPoint);
            ctx.stroke();
        }

        currPoint = spline.value(i + 1);

        ctx.lineTo(...currPoint);
        ctx.stroke();

        prevDer = currDer;
    }
    ctx.lineWidth = 1;
}

function ApproxLineDraw() {
    const points = SplineList[splineInd].points;
    const beziers = SplineList[splineInd].beziers
    if (points.length === 0 || points.length === 2 || ((points.length - (beziers.length * 4 - (beziers.length - 1)) === 0) && points.length > 3))
        return;

    const lastPoint = points[points.length - 1];

    ctx.beginPath();
    ctx.setLineDash([10, 10]);
    ctx.moveTo(lastPoint[0], lastPoint[1]);

    ctx.strokeStyle = "black";
    ctx.fillStyle = "black";

    ctx.lineTo(mousePoint[0], mousePoint[1]);
    ctx.stroke();
}
