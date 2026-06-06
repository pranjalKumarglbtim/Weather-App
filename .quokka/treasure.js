// Welcome to Quokka Pro Treasure Hunt! It only takes a minute to complete,
// and a very special surprise awaits those who can do it.

// If you get stuck, here's some pointers:
// Quick Module Install:  https://quokkajs.com/docs/#modules
// Live Comments:         https://quokkajs.com/docs/#comments
// Value Explorer:        https://quokkajs.com/docs/#value-explorer

// Good luck and enjoy!

// 1) Fix the error below and install the missing module for the current quokka
//    file using the link in the Quokka output or in the line hover message
//    or quick action.

const chest = require('quokka-treasure-chest')

// 2) So, you have found an old chest, there may be some treasure inside it.
//    You need to pass a correct string key to the "open" function.
//    The "open" function returns a clue about how to find the key.
//    Add Quokka live comment at the end of the line to see the returned value:
//    chest.open('paste_key_here') //?

// SOLUTION: The key is '7acd', found by exploring nested objects in explore_me:
// - front side -> ornament -> cryptic writing -> "You found the key! Quick, use it to unlock the chest"
// - underneath -> ancient parchment -> "You found the key! Quick, use it to unlock the chest (copy and paste it in the code)!: 7acd"

chest.open('7acd') // Treasure unlocked!