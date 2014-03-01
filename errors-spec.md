All examples unless otherwise noted based on signature: `function(a, b, c, d){...}`.

#### 1. Throw error when there is a trailing hole, and the arg count (which must not include `___`) does not exactly match param count.

From the left:

    (1, _)    // Should have been: (1, ___)
    (1, _, _) // Should have been: (1, ___)
    (1, 2, _) // Should have been: (1, 2, ___)

From the right:

    (___, _, 4)    // Should have been: (___, 4)
    (___, _, _, 4) // Should have been: (___, 4)
    (___, _, 3, 4) // Should have been: (___, 3, 4)

Inversely, the following are NOT cases of trailing holes:

    (1, 2, _, _) // Ok, args count matches param count
    (1, 2, 3, _) // Ok, args count matches param count
    (1, _, 3, _) // Ok, args count matches param count
    (___)        // Ok, special-cased to DELAY ONCE


#### 2. Throw error when args count > params count.

    (0, 1, 2, 3, ___, _) // Not ok
    (0, 1, 2, 3, 4, ___) // Not ok

Exception when there is one extra argument and it is `___`:

    (0, 1, 2, 3, ___) // Ok

#### 3. Throw error when more than one `___` is present.

#### 4. Throw error when single `_` used to delay.