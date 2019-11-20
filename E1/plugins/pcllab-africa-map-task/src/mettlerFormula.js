const DELAY = 1;                /* Enforced delay between each item */
const PRIORITY_INCREMENT = 20;  /* How much to increase or decrease priority of an item */
const DEFAULT_PRIORITY_MET = 1.1;         /* Value used to demarcate a boundary after which new items are allowed to be presented */
const A = 0.1;                  /* The rapidity with which priority accumulated as function of elapsed trials */
const B = 1.1;                  /* Modulate relation between RT and spacing intervals */
const R = 3.0;                  /* Modulate relation between RT and spacing intervals */
const TASK = 'pcllab-africa-map-task';


/**
 * @constructor
 * @param {string: The country name} name
 * Represents each mettler item that will be displayed 
 */
function MettlerItem(name) {
    this.countryName = name;                    /* The name of the country */
    this.priority = DEFAULT_PRIORITY_MET;       /* The default priority */
    this.numSinceLastTrials = 1;                /* Number of trials that have elapsed between last presentation */
    this.accuracy = 1;                          /* Whether the answer was correct or incorrect */
    this.responseTime = 6;                     /* How long it took the user to respond */
    this.timesShown = 0;                        /* How many times a word has been seen by the user */
    this.timesCorrect = 0;
}

/**
 * Calculate the priority using the ARTS algorithm
 * @param {MettlerItem} item 
 * @returns {number: item priority}
 */
function MettlerPriority(item) {
    var thisPri = A * (item.numSinceLastTrials - DELAY) * (B * (1 - item.accuracy) * Math.log(item.responseTime / R) + item.accuracy * PRIORITY_INCREMENT);
    return thisPri;
}


/**
 * Update the array and items in order to create the next trial item that will be added
 * @param {MettlerItem: The item that was just presented} curItem 
 * @param {number: The total time elapsed for this answer} thisTimeElapsed 
 * @param {number: The total time elapsed for previous answer} prevTimeElapsed 
 * @param {number: 1 if correct, 0 if not} correctness 
 * @param {Array: Array with all of the mettler items} mettlerItemArr 
 * @returns {json: next trial, next item to present, and newly organized array}
 */
function getNextMettlerItem(curItem, thisTimeElapsed, prevTimeElapsed, correctness, mettlerItemArr) {
    curItem.numSinceLastTrials = 1;
    curItem.responseTime = (thisTimeElapsed - prevTimeElapsed) / 1000.0;
    curItem.accuracy = correctness;
    curItem.timesShown++;
    var prevName = curItem.countryName;

    /* Calculate the new priority for each item */
    curItem.priority = MettlerPriority(curItem);
    for (element of mettlerItemArr) {
        element.numSinceLastTrials++;
        element.priority = MettlerPriority(element);
    }

    /* Push most recent answer onto array and sort in descending order by priority */
    if (curItem.timesCorrect < 4) {
        mettlerItemArr.push(curItem);
    }
    mettlerItemArr.sort((i1, i2) => i2.priority - i1.priority);
    if (mettlerItemArr[0].countryName == prevName) {
        var temp = mettlerItemArr[0];
        mettlerItemArr[0] = mettlerItemArr[1];
        mettlerItemArr[1] = temp;
    }

    curItem = mettlerItemArr.shift();

    if (curItem != undefined) {
        var nextTrial = {
            type: TASK,
            target: curItem.countryName,
            feedback: true,
            on_finish: function() {
                jsPsych.pauseExperiment();
                //console.log(mettlerItemArr);
                var buttonel = document.getElementById('selected');
                if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                    correctness = 0;
                } else {
                    correctness = 1;
                }

                thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
                var info = getNextMettlerItem(curItem, thisTimeElapsed, prevTimeElapsed, correctness, mettlerItems);
                if (info == undefined) {
                    //jsPsych.data.displayData();
                    givePosttest();
                    return;
                }
                var trial = info.trial;
                curItem = info.curItem;
                mettlerItems = info.mettlerItemArr;
                prevTimeElapsed = thisTimeElapsed;
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
        mettlerItemArr: mettlerItemArr
    }

}

/**
 * Populate the array that will have the country items
 * @param {json: Contains all country names and coordinates on map} allCountries
 * @returns {array: the array with all mettlerItems}  
 */
function createMettlerItems(allCountries) {
    var countryItems = [];

    for (var key in allCountries) {
        var nameArr = key.split('_');
        var formatName = "";
    
        for (var i = 0; i < nameArr.length; i++) {
            nameArr[i] = nameArr[i].charAt(0).toUpperCase() + nameArr[i].slice(1);
            if (i != 0) {
                formatName += ' ';
            }
            formatName += nameArr[i];
        }
        countryItems.push(new MettlerItem(formatName));
    }
    return countryItems;
}
