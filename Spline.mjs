import {Bezier} from "./Bezier.mjs";
import * as vec from "./Vector.mjs";

export class Spline {
    constructor(curves) {
        this.curves = curves;
        this.bezierComposite = ((t) => {
            if (t !== curves.length)
                return new Bezier(curves[Math.floor(t)].points).value(t - Math.floor(t))
            else
                return curves[curves.length - 1].points[curves[curves.length - 1].points.length - 1]
        })
    }
    value (t) {
        return this.bezierComposite(t);
    }
    derivative (t) {
        return new Bezier(this.curves[Math.floor(t)].points).derivative(t - Math.floor(t))
    }

    makeContinuous() {
        for (let i = 0; i < this.curves.length - 1; i++) {
            const pointsLen = this.curves[i].points.length
            let val = this.curves[i].points[pointsLen - 1].map((e, ind) => (e + this.curves[i + 1].points[0][ind]) / 2);
            this.curves[i].points[pointsLen - 1] = val;
            this.curves[i + 1].points[0] = val;
        }
    }

    makeSmooth() {
        for (let i = 0; i < this.curves.length - 1; i++) {
            const currPointLen = this.curves[i].points.length;
            const nextPointLen = this.curves[i + 1].points.length;

            const currDer = this.curves[i].derivative(1);
            const nextDer = this.curves[i + 1].derivative(0);

            const avg = vec.scalar(vec.add(currDer, nextDer), 1 / 2);

            const Pn = this.curves[i].points[currPointLen - 1];
            const P2 = this.curves[i + 1].points[0];

            this.curves[i].points[currPointLen - 2] = vec.subtract(Pn, vec.scalar(avg, 1 / (currPointLen - 1)));
            this.curves[i + 1].points[1] = vec.add(P2, vec.scalar(avg, 1 / (nextPointLen - 1)));
        }
    }
}
