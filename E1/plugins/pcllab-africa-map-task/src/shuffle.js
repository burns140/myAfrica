/**
 * Shuffle the item array 
 * @param {array: containing the items} array 
 * @returns {array: shuffled array}
 */
function fisherYatesShuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    /* While there remain elements to shuffle... */
    while (0 !== currentIndex) {

        /* Pick a remaining element */
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        /* Swap it with the current element */
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}