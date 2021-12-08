# Factorial


## Introduction


In mathematics, the factorial of a non-negative integer `n`,
denoted by `n!`, is the product of all positive integers less
than or equal to `n`. For example:

```
5! = 5 * 4 * 3 * 2 * 1 = 120
```

| n   |                n! |
| --- | ----------------: |
| 0   |                 1 |
| 1   |                 1 |
| 2   |                 2 |
| 3   |                 6 |
| 4   |                24 |
| 5   |               120 |
| 6   |               720 |
| 7   |             5 040 |
| 8   |            40 320 |
| 9   |           362 880 |
| 10  |         3 628 800 |
| 11  |        39 916 800 |
| 12  |       479 001 600 |
| 13  |     6 227 020 800 |
| 14  |    87 178 291 200 |
| 15  | 1 307 674 368 000 |

### TODO

Implement the logic for the factorial in Node.js, inside a pure function, and a wrapper who'll run the test from 1 to n.
The program should be invoked with 
```shell
npm run factorial n
``` 
and must ouput factorial values from 1 to n.

### Expected output
If n=15, expected output is:
```shell
1
2
6
24
120
720
5040
40320
362880
3628800
39916800
479001600
6227020800
87178291200
1307674368000
```
