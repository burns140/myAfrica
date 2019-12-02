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
            data: {
                period: `posttest`,
                question: curItem.countryName
            },
            on_finish: function(data) {
                jsPsych.pauseExperiment();
                var buttonel = document.getElementById('selected');
                if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                    correctness = 0;
                } else {
                    correctness = 1;
                }
                thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
                data.rt = thisTimeElapsed - prevTimeElapsed;
                data.correctness = correctness;
                data.response = buttonel.textContent.toLowerCase();
                var info = getNextPosttestItem(curItem, correctness, regularItems);
                if (info == undefined) {
                    console.log('post test done'); 
                    finishPost();              
                    return;
                }
                
                var trial = info.trial;
                curItem = info.curItem;
                regularItems = info.regularItemArr;
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
        regularItemArr: regularItemArr
    }

}

function finishPost() {
    jsPsych.data.addProperties({
        worker_id: this.workerId,
        condition: this.condition,
        timestamp: new Date().toUTCString()
    })
    //jsPsych.data.displayData();

    //let myData = jsPsych.data.dataAsJSON() // Data for the experiment
    const myData = jsPsych.data.getData();
    console.log('posting data');
    /*$.ajax('https://jarvis.psych.purdue.edu/api/v1/experiments/data/5de3fc9d11c7ce47f46164fb', {
            data: JSON.stringify(myData),
            contentType: 'application/json',
            type: 'POST'
        })
        */
    //postDebr();
    jsPsych.resumeExperiment();
    //return;
}

function postDebr() {
    var debrief_trial = {
        type: 'pcllab-core',
        stimuli: [{"title": "Debriefing",
        "text": "<h2 style=\"text-align: center\">Thank you for your participation!</h2><br><br> <a href=\"debriefing.html\" style=\"text-align: center\" target=\"_blank\">Click here to read about the purpose of this experiment</a>"        }],
        response_count: 0,
        data: {
            period: 'instructions'
        }
    }
    jsPsych.addNodeToEndOfTimeline({
        timeline: [debrief_trial]
    }, jsPsych.resumeExperiment)
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
        data: {
            period: `posttest`,
            question: curItem.countryName
        },
        on_finish: function(data) {
            jsPsych.pauseExperiment();
            var buttonel = document.getElementById('selected');
            if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                correctness = 0
            } else {
                correctness = 1
            }
            thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;
            data.rt = thisTimeElapsed - prevTimeElapsed;
            data.correctness = correctness;
            data.response = buttonel.textContent.toLowerCase();
            var info = getNextPosttestItem(curItem, correctness, regularItems);
            var trial = info.trial;
            curItem = info.curItem;
            regularItems = info.regularItemArr;
            prevTimeElapsed = thisTimeElapsed;
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
        "text": "<p style=\"text-align: center\">You have just studied a group of 24 items. <br> <p style=\"text-align: center\">Click Continue when you are ready to continue the learning.</p>"
        }],
        response_count: 0,
        show_button: true,
        button_text: 'continue',
        data: {
            period: 'break'
        },
        on_finish: function() {
            prevTimeElapsed = thisTimeElapsed;
            var nextTrial;
            block++;
            console.log(condition);
            if (condition == constants.CONDITION_FIXED) {
                console.log('in fixed');
                nextTrial = {
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
            } else if (condition == constants.CONDITION_METTLER) {
                nextTrial = {
                    type: TASK,
                    target: curItem.countryName,
                    feedback: true,
                    data: {
                        period: `block ${block}`,
                        question: curItem.countryName.toLowerCase(),
                    },
                    on_finish: function(data) {
                        jsPsych.pauseExperiment();
                        //console.log(mettlerItemArr);
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
                            breakInstr();
                            return 0;
                        }
                        var info = getNextMettlerItem(curItem, correctness, mettlerItems);
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
            } else if (condition == constants.CONDITION_MEMORIZE) {
                nextTrial = {
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
                            breakInstr();
                            return 0;
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
                            prevTimeElapsed = thisTimeElapsed;
                            jsPsych.addNodeToEndOfTimeline({
                                timeline: [trial]
                            }, jsPsych.resumeExperiment) 
                        }
                        
                    }
                }
            } else {
                console.log('how');
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