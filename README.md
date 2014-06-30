# purry [![Build Status](https://travis-ci.org/jasonkuhrt/purry.png?branch=master)](https://travis-ci.org/jasonkuhrt/purry)

[![browser support](https://ci.testling.com/jasonkuhrt/purry.png)
](https://ci.testling.com/jasonkuhrt/purry)

  Symbiotic, performent **currying** and **partial application**.



## Installation

Server | Client
-------|--------
`npm install --save purry` | `component install jasonkuhrt/purry`

## Guide

Purry greatly facilitates use of and interopability between two helpful techniques that come from the world of functional programming: Currying, and Partial Application. If these concepts are not familiar to you go read their [background](#background). Purry docs assume fluency in the topics.



## Background

##### Currying
The act of supplying fewer arguments to a function `f1` than it is has parameters which (given `f1` is curried) returns a new function `f2` whose parameters are those that were not argued against `f1` before. For example:
```js
// Imagine f1 is this add function:

add(1, 2)
// 3

// f2 would be derived like so:
var add1 = add(1)

// Ready to be used in high-order contexts, etc.:
[1,2,3,4,5].map(add1)
// [2,3,4,5,6]
```
Canocially, currying works left-to-right.

Learn more in @fogus's tour de force [Functional JavaScript](http://www.functionaljavascript.com/) in the "Currying" section in Chapter 5. Function-Building Functions. It includes many examples, use-cases, diagrams, etc.

In lieu of buying the book try: http://programmers.stackexchange.com/questions/185585/what-is-the-advantage-of-currying

##### Partial Application
The act of "pinning" arguments to a function's parameters. Differences from currying:

1. Partial application may work from left-to-right OR right-to-left whereas currying is strictly left-to-right. The direction simply means whether the partially-applied arguments will be prepended or appended to the arguments given to the function at invoke-time. Notice how right-to-left is different and sometimes needed:
  ```js
  // First, regular left-to-right stuff:
  var subFrom10 = sub(10) // currying example
  var subFrom10Alt = sub(10,___) // partial application example

  subFrom10(6) // 4
  subFrom10Alt(6) // 4

  // But how do we create a sub10 function?
  // We can with right-to-left partial application:
  var sub10 = sub(___,10)
  sub10(6) // -4
  ```

2. Partial application necessarially implies an invocation delay whereas currying does not. Notice how currying invokes the function as soon as all parameters are argued:
  ```js
  add(1)(2) // 3
  add(1,___)(2,___)() // 3
  ```
Learn more in @fogus's tour de force [Functional JavaScript](http://www.functionaljavascript.com/) in the "Partial Application" section in Chapter 5. Function-Building Functions. It includes many examples, use-cases, diagrams, etc.

3. Partial application under purry's auspicious implementation has an additional feature in addition to pinning left-to-right pins or right-to-left: holes. Holes allow saving arguments against any arbitrary point in the parameter list. Behold a contrived example:

  ```js
  // Assume a "person" function that accepts three
  // parameters: first name, last name, age.
  person('John', 'Smith', 30)
  // { first: 'John', last: 'Smith', age: 30 }

  // When dealing with families, repeating the last
  // name can be redundant. Holes could help:
  var psmith = person(_, 'Smith', _)

  [['Sarah', 30], ['Ryan', 32], ['Timmy', 2]].map(psmith)
  // [{ first: 'Sarah', last: 'Smith', age: 30 }, ...]
  ```
Learn more by reading purry's documentation.



## Roadmap
  I am actively working on this project. I hope to release a genuinely useful iteration in 2014. Contributions and collaborations are more than welcomed. See the tests for what is currently possible, they are truth.
