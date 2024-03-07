import {binomial, Bernstein} from "./Bernstein.mjs";
export class Bezier {
    constructor(points) {
        this.points = points;
        this.bezierCurve = ((t) => {
            let lst = points[0].map(() => 0);
            const pLen = points.length - 1
            for (let i = 0; i < points.length; i++) {
                for (let j = 0; j < points[i].length; j++) {
                    lst[j] += binomial(pLen, i) * Math.pow((1 - t), (pLen - i)) * Math.pow(t, i) * points[i][j];
                }
            }
            return lst;
        });
    }
    value(t) {
        return this.bezierCurve(t)
    }
    derivative(t) {
        let lst = this.points[0].map(() => 0);
        for (let i = 0; i < this.points.length - 1; i++) {
            let polynomial = new Bernstein(this.points.length - 2, i).value(t)
            for (let j = 0; j < this.points[i].length; j++) {
                lst[j] += polynomial * (this.points[i + 1][j] - this.points[i][j])
            }
        }
        return lst.map(dig => dig * (this.points.length - 1))
    }
}
