const FIXED_SPACING = 7;

/**
 * @constructor
 * @param {string: The country name} name
 * Represents each fixed item that will be displayed 
 */
function FixedItem(name) {
    this.countryName = name;
    this.accuracy = 1;
    this.timesShown = 0;
    this.timesCorrect = 0;
}

/**
 * Populate the array that will have the country items
 * @param {json: Contains all country names and coordinates on map} allCountries
 * @returns {array: the array with all mettlerItems}  
 */
function createFixedItems(allCountries) {
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
        countryItems.push(new FixedItem(formatName));
    }
    return countryItems;
}

function getNextFixedItem(curItem, correctness, fixedItemArr) {
    console.log(totalItemsShown);
    //console.log('get new item');
    curItem.accuracy = correctness;
    curItem.timesShown++;
    //console.log(`${curItem.countryName}: ${curItem.timesShown}`);

    if (curItem.timesShown < 4 || filler.hasOwnProperty(curItem.countryName.toLowerCase().replace(/ /g, '_'))) {
        fixedItemArr.splice(FIXED_SPACING, 0, curItem);
        if (filler.hasOwnProperty(curItem.countryName.toLowerCase().replace(/ /g, '_'))) {
            console.log("FILLER---------------------------------");
        }
    }
    if (curItem.timesShown == 4) {
        console.log(curItem.countryName);
    }

    //console.log(fixedItemArr);
    //console.log(fixedItemArr.length);

    curItem = fixedItemArr.shift();

    if (curItem != undefined && fixedItemArr.length > (FIXED_SPACING - 1)) {
        var nextTrial = {
            type: TASK,
            target: curItem.countryName,
            feedback: true,
            data: {
                period: `block ${block}`,
                question: curItem.countryName.toLowerCase(),
            },
            on_finish: function(data) {
                jsPsych.pauseExperiment();
                totalItemsShown++;
                thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
                data.rt = thisTimeElapsed - prevTimeElapsed;
                var buttonel = document.getElementById('selected');
                if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                    correctness = 0;
                } else {
                    correctness = 1;
                }
                data.correctness = correctness;
                data.response = buttonel.textContent.toLowerCase();
                if (totalItemsShown % 24 == 0) {
                    prevTimeElapsed = thisTimeElapsed;
                    console.log('calling break');
                    var breakNode = breakInstr(curItem);
                    jsPsych.addNodeToEndOfTimeline({
                        timeline: [breakNode]
                    }, jsPsych.resumeExperiment)
                } else {
                    var info = getNextFixedItem(curItem, correctness, fixedItems);
                    if (info == undefined) {
                        postInstr();
                    } else if (info == 0) {
                        console.log('was 0');
                        jsPsych.resumeExperiment();
                        //return {};
                    } else {
                        var trial = info.trial;
                        curItem = info.nextItem;
                        fixedItems = info.fixedItemArr;
                        prevTimeElapsed = thisTimeElapsed;
                        jsPsych.addNodeToEndOfTimeline({
                            timeline: [trial]
                        }, jsPsych.resumeExperiment)
                    }
                }
                
                
            }
        }
    } else {
        console.log(curItem);
        for (tempCountry of fixedItemArr) {
            console.log(tempCountry);
        }
        return undefined;
    }

    //console.log('return item');
    return {
        trial: nextTrial,
        nextItem: curItem,
        fixedItemArr: fixedItemArr
    }
    
}