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
        button_text: 'continue',
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