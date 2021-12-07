## FizzBuzz

Fizz buzz is a group word game for children to teach them about division. Players take turns to count incrementally, replacing any number divisible by three with the word "fizz", and any number divisible by five with the word "buzz".

### Game Logic
Players generally sit in a circle. The player designated to go first says the number "1", and the players then count upwards in turn. 
However, any number divisible by three is replaced by the word **fizz** and any number divisible by five by the word **buzz**. 
Numbers divisible by 15 become **fizzbuzz**. 
A player who hesitates or makes a mistake is eliminated from the game.

### TODO

Implement the logic for the fizzbuzz in Node.js, inside a pure function, and a wrapper who'll run the test from 1 to n.
The program should be invoked with 
```shell
npm run fizzbuzz n
``` 
and must ouput fizzbuzz values from 1 to n.

### Expected output
If n=36, expected output is:
```shell
1
2
fizz
4
buzz
fizz
7
8
fizz
buzz
11
fizz
13
14
fizzbuzz
16
17
fizz
19
buzz
fizz
22
23
fizz
buzz
26
fizz
28
29
fizzbuzz
31
32
fizz
34
buzz
fizz
```

### Time

The excercise should take less than 2 hours.
