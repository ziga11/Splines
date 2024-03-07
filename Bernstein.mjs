export function binomial(n, k) {
    let coefficient = 1;
    if (n > k) {
        for (let i = n - k + 1; i <= n; i++)
            coefficient *= i;
        for (let i = 1; i <= k; i++)
            coefficient /= i;
    }
    else {
        for (let i = k - n + 1; i <= k; i++)
            coefficient *= i;
        for (let i = 1 ; i <= n; i++)
            coefficient /= i;
    }
    return coefficient
}


export class Bernstein {
    constructor(n, k) {
        this.n = n;
        this.k = k;
        this.polynomial = ((n, k, x) => {
            if (n > k)
                return binomial(n, k) * Math.pow(x, k) * Math.pow((1 - x), (n - k));
            else
                return binomial(k, n) * Math.pow(x, n) * Math.pow((1 - x), (k - n));
        });
    }

    value(t) {
        return this.polynomial(this.n, this.k, t);
    }

    derivative(t) {
        if (this.n > this.k)
            return this.n * (this.polynomial(this.n - 1, this.k - 1, t) - this.polynomial(this.n - 1, this.k, t));
        else
            return this.k * (this.polynomial(this.n - 1, this.k - 1, t) - this.polynomial(this.n, this.k - 1, t));
    }
}

