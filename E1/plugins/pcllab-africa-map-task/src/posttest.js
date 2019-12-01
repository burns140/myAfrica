/**
 * @constructor
 * @param {string: The country name} name
 * Represents each item that will be displayed 
 */
function postItem(name) {
    this.countryName = name;                    /* The name of the country */
    this.accuracy = 1;
}

/**
 * Populate the array that will have the country items
 * @param {json: Contains all country names and coordinates on map} allCountries
 * @returns {array: the array with all postItems}  
 */
function createPostItems(allCountries) {
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
        countryItems.push(new postItem(formatName));
    }
    return countryItems;
}

function getNextPosttestItem(curItem, correctness, regularItemArr) {
    if (correctness == 0) {
        curItem.accuracy = 0;
    } else {
        curItem.accuracy = 1;
    }

    results.push(curItem);
    curItem = regularItemArr.shift();

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
                var info = getNextPosttestItem(curItem, correctness, regularItems);
                if (info == undefined) {
                    console.log('post test done');
                    return;
                }
                var trial = info.trial;
                curItem = info.curItem;
                regularItems = info.regularItemArr;
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
        regularItemArr: regularItemArr
    }

}

function postInstr() {
    var instructions_trial = {
        type: 'pcllab-core',
        stimuli: [{"title": "Instructions",
        "text": "<p>You will now take a test on the countries that you studied earlier. You will no longer receive feedback after each answer. <br> <p style=\"text-align: center\">Click Begin when you are ready to begin the posttest.</p>"
        }],
        response_count: 0,
        show_button: true,
        button_text: 'begin',
        data: {
            period: 'instructions'
        },
        on_finish: function() {
            givePosttest();
        }
    }
    jsPsych.addNodeToEndOfTimeline({
        timeline: [instructions_trial]
    }, jsPsych.resumeExperiment)
}

function givePosttest() {
    curItem = regularItems.shift();
    firstTrial = {
        type: TASK,
        target: curItem.countryName,
        feedback: true,
        on_finish: function() {
            jsPsych.pauseExperiment();
            var buttonel = document.getElementById('selected');
            if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                correctness = 0
            } else {
                correctness = 1
            }
            var info = getNextPosttestItem(curItem, correctness, regularItems);
            var trial = info.trial;
            curItem = info.curItem;
            regularItems = info.regularItemArr;

            jsPsych.addNodeToEndOfTimeline({
                timeline: [trial]
            }, jsPsych.resumeExperiment)
        }
    }
    jsPsych.addNodeToEndOfTimeline({
        timeline: [firstTrial]
    }, jsPsych.resumeExperiment)
    //this.timeline.push(firstTrial);
}

function breakInstr() {
    var instructions_trial = {
        type: 'pcllab-core',
        stimuli: [{"title": "Instructions",
        "text": "<p>You have just studied a group of 24 items. <br> <p style=\"text-align: center\">Click Continue when you are ready to continue the learning.</p>"
        }],
        response_count: 0,
        show_button: true,
        button_text: 'continue',
        data: {
            period: 'instructions'
        },
        on_finish: function() {
            var nextTrial;
            console.log(condition);
            if (condition == constants.CONDITION_FIXED) {
                console.log('in fixed');
                nextTrial = {
                    type: TASK,
                    target: curItem.countryName,
                    feedback: true,
                    on_finish: function() {
                        jsPsych.pauseExperiment();
                        totalItemsShown++;
                        var buttonel = document.getElementById('selected');
                        if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                            correctness = 0;
                        } else {
                            correctness = 1;
                        }
                        thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
                        if (totalItemsShown % 24 == 0) {
                            breakInstr();
                            return 0;
                        }
                        var info = getNextFixedItem(curItem, correctness, fixedItems);
                        if (info == undefined) {
                            //jsPsych.data.displayData();
                            console.log('undefined');
                            postInstr();
                        } else if (info == 0) {
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
            } else if (condition == "mettler") {
                nextTrial = {
                    type: TASK,
                    target: curItem.countryName,
                    feedback: true,
                    on_finish: function() {
                        jsPsych.pauseExperiment();
                        //console.log(mettlerItemArr);
                        totalItemsShown++;
                        thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
                        if (totalItemsShown % 24 == 0) {
                            prevTimeElapsed = thisTimeElapsed;
                            breakInstr();
                            return 0;
                        }
                        var buttonel = document.getElementById('selected');
                        if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                            correctness = 0;
                        } else {
                            correctness = 1;
                        }
                        var info = getNextMettlerItem(curItem, thisTimeElapsed, prevTimeElapsed, correctness, mettlerItems);
                        if (info == undefined) {
                            //jsPsych.data.displayData();
                            postInstr();
                        } else if (info == 0) {
                            //return {};
                        } else {
                            var trial = info.trial;
                            curItem = info.curItem;
                            mettlerItems = info.mettlerItemArr;
                            prevTimeElapsed = thisTimeElapsed;
                            jsPsych.addNodeToEndOfTimeline({
                                timeline: [trial]
                            }, jsPsych.resumeExperiment)
                        }
    
                    }
                }
            } else if (condition == "memorize") {
                nextTrial = {
                    type: TASK,
                    target: curItem.countryName,
                    feedback: true,
                    on_finish: function() {
                        jsPsych.pauseExperiment();
                        totalItemsShown++;
                        if (totalItemsShown % 24 == 0) {
                            breakInstr();
                            return 0;
                        }
                        var buttonel = document.getElementById('selected');
                        if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                            correctness = 0;
                        } else {
                            correctness = 1;
                        }
                        
                        var info = getNextMemorizeItem(curItem, correctness, memorizeItems);
                        if (info == undefined) {
                            //jsPsych.data.displayData();
                            postInstr();
                        } else if (info == 0) {
                            //return {};
                        } else {
                           var trial = info.trial;
                            curItem = info.curItem;
                            memorizeItems = info.memorizeItemArr;
                            jsPsych.addNodeToEndOfTimeline({
                                timeline: [trial]
                            }, jsPsych.resumeExperiment) 
                        }
                        
                    }
                }
            } else {
                console.log('fuckin how');
            }
            jsPsych.addNodeToEndOfTimeline({
                timeline: [nextTrial]
            }, jsPsych.resumeExperiment)
        }
    }
    jsPsych.addNodeToEndOfTimeline({
        timeline: [instructions_trial]
    }, jsPsych.resumeExperiment)
}