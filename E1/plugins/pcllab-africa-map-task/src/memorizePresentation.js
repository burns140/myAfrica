const N_0 = 1;
const Q = 1;
const T = 10.0;
const RIGHT = -0.0061;
const WRONG = -0.0802;
const alpha = -1 * (Math.pow(2, (-1 * RIGHT))) + 1;
const beta = (Math.pow(2,  (-1 * WRONG)) - 1);

function rexp(n, rate) {
    n = _v(n, "n");
    rate = _v(rate, "pos", 1);

    var toReturn = [];

    for (var i = 0; i < n; i++) {
        toReturn[i] = (-1 * Math.log(prng()) / rate);
    }

    return toReturn;
}

function runif(n, min, max) {
    n = _v(n, "n");
    min = _v(min, "r", 0);
    max = _v(max, "r", 1);
    if (min > max) {
        throw 'Min can\'t be greater than max';
    }

    var toReturn = [];

    for (var i = 0; i < n; i++) {
        var raw = prng();
        var scaled = min + raw * (max - min);
        toReturn.push(scaled);
    }

    return toReturn;
}

function rint(n, min, max, inclusive) {
    n = _v(n, "n");
    min = _v(min, "int");
    max = _v(max, "int");
    if (!inclusive) {
        min++;
        if (min == max) {
            throw 'Min can\'t be greater than max';
        }
    } else {
        max++;
    }

    if (min > max) {
        throw 'Min can\'t be greater than max';
    }

    var toReturn = [];

    var raw = runif(n, min, max);

    for (var i = 0; i < n; i++) {
        toReturn[i] = Math.floor(raw[i]);
    }

    return toReturn;
}

function prng(len) {
    if (len == undefined) {
        len = 16;
    }

    var entropy = [];
    for (var i = 0; i < 16; i++) {
        entropy.push(0);
    }

    var crypto = new Crypto();
    entropy = crypto.getRandomValues();
    //var entropy = crypto.randomBytes(len);
    var result = 0;

    for (var i = 0; i < len; i++) {
        result = result + Number(entropy[i]) / Math.pow(256, (i + 1));
    }

    return result;
}

function _v(param, type, defaultParam) {
    if(param == null && defaultParam != null) {
        return defaultParam;
    }

    switch(type) {

        // Array of 1 item or more
        case "a":
            if(!Array.isArray(param) || !param.length) throw new Error("Expected an array of length 1 or greater");
            return param.slice(0);

        // Integer
        case "int":
            if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
            if(param !== Math.round(param)) throw new Error("Parameter must be a whole number");
            if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
            return param;

        // Natural number
        case "n":
            if(param === undefined) throw new Error("You must specify how many values you want");
            if(param !== Number(param)) throw new Error("The number of values must be numeric");
            if(param !== Math.round(param)) throw new Error("The number of values must be a whole number");
            if(param < 1) throw new Error("The number of values must be a whole number of 1 or greater");
            if(param === Infinity) throw new Error("The number of values cannot be infinite ;-)");
            return param;

        // Valid probability
        case "p":
            if(Number(param) !== param) throw new Error("Probability value is missing or not a number");
            if(param > 1) throw new Error("Probability values cannot be greater than 1");
            if(param < 0) throw new Error("Probability values cannot be less than 0");
            return param;

        // Positive numbers
        case "pos":
            if(Number(param) !== param) throw new Error("A required parameter is missing or not a number");
            if(param <= 0) throw new Error("Parameter must be greater than 0");
            if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
            return param;

        // Look for numbers (reals)
        case "r":
            if(Number(param) !== param) throw new Error("A required parameter is missing or not a number");
            if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
            return param;

        // Non negative real number
        case "nn":
            if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
            if(param < 0) throw new Error("Parameter cannot be less than 0");
            if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
            return param;

        // Non negative whole number (integer)
        case "nni":
            if(param !== Number(param)) throw new Error("A required parameter is missing or not a number");
            if(param !== Math.round(param)) throw new Error("Parameter must be a whole number");
            if(param < 0) throw new Error("Parameter cannot be less than zero");
            if(param === Infinity) throw new Error("Sent 'infinity' as a parameter");
            return param;

        // Non-empty string
        case "str":
            if(param !== String(param)) throw new Error("A required parameter is missing or not a string");
            if(param.length === 0) throw new Error("Parameter must be at least one character long");
            return param;
    }
}

function calcForgettingRate(item) {
    if (item.accuracy == 0) {
        return (1 - alpha) * item.forgettingRate;
    } else if (item.accuracy == 1) {
        return (1 + beta) * item.forgettingRate;
    } else {
        throw 'Accuracy wasn\'t one or zero';
    }
}

function calcRecallProb(item) {
    return Math.exp(-1 * item.forgettingRate * item.sinceLastSeen);
}

function calcReviewingIntensity(item) {
    return Math.pow(Q, -0.5) * (1 - item.p_recall);
}

function intensity(t, n_t, q) {
    return (1.0 / Math.sqrt(q)) * (1 - Math.exp(-1 * n_t * t));
}



/**
 * Get a sample from the necessary distribution
 * @param {*} n_t 
 * @param {*} q 
 * @param {*} T 
 */
function sampler(n_t, q, T) {
    var t = 0;
    while (true) {
        var max_int = 1.0 / Math.sqrt(q);
        var t_ = rexp(1, max_int)[0];        // Get a value randomly sampled from exponential distribution          
        if ((t_ + t) > T) {
            return;
        }
        t = t + t_;
        var proposed_int = intensity(t, n_t, q);    // Calculate the forgetting intensity
        if (rint(1, 0, 1)[0] < (proposed_int / max_int)) {       //Get a value sampled from a uniform distribution
            return t;
        }
    }
}

function getNextMemorizeItem(curItem, correctness, memorizeItemArr) {
    curItem.accuracy = correctness;
    curItem.forgettingRate = calcForgettingRate(curItem);
    curItem.p_recall = calcRecallProb(curItem);
    curItem.reviewingItensity = calcReviewingIntensity(curItem);
    curItem.priority = sampler(curItem.forgettingRate, Q, T);

    if (correctness == 0) {
        curItem.timesCorrect++;
    }

    for (var el of memorizeItemArr) {
        el.sinceLastSeen++;
        el.p_recall = calcRecallProb(el);
    }

    if (curItem.timesCorrect < 4) {
        memorizeItemArr.push(curItem);
    }
    
    memorizeItemArr.sort((i1, i2) => i2.p_recall - i1.p_recall);
    if (memorizeItemArr[0].countryName == prevName) {
        var temp = memorizeItemArr[0];
        memorizeItemArr[0] = memorizeItemArr[1];
        memorizeItemArr[1] = temp;
    }

    curItem = memorizeItemArr.shift();

    if (curItem != undefined) {
        var nextTrial = {
            type: TASK,
            target: curItem.countryName,
            feedback: true,
            on_finish: function() {
                jsPsych.pauseExperiment();
                var buttonel = document.getElementById('selected');
                if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                    correctness = 0;
                } else {
                    correctness = 1;
                }
                var info = getNextMemorizeItem(curItem, correctness, memorizeItems);
                if (info == undefined) {
                    //jsPsych.data.displayData();
                    givePosttest();
                    return;
                }
                var trial = info.trial;
                curItem = info.curItem;
                memorizeItems = info.memorizeItemArr;

                jsPsych.addNodeToEndOfTimeline({
                    timeline: [trial]
                }, jsPsych.resumeExperiment)
            }
        }
    } else {
        return undefined;
    }

    return {
        trial: nextTrial,
        curItem: curItem,
        memorizeItemArr: memorizeItemArr
    }
}

function MemorizeItem(key) {
    this.forgettingRate = 1;
    this.countryName = key;
    this.p_recall = Math.pow(10, -10);
    this.sinceLastSeen = 0;
    this.accuracy = -1;
    this.reviewingItensity = -1;
    this.priority = 0;
    this.timesCorrect = 0;
}

function createMemorizeItems(allCountries) {
    var memorizeItemArray = [];
    for (var key in allCountries) {
        memorizeItemArray.push(new MemorizeItem(key));
    }
    return memorizeItemArray;
}

