constants = {
    INSTRUCTIONS = 'materials/instructions.json',
    CONDITION_FIXED = 'fixed',
    CONDITION_METTLER = 'mettler',
    CONDITION_MEMORIZE = 'memorize'
}

class Experiment {
    constructor() {
        this.workerid = null;
        this.instructions = null;
        this.condition = null;
        this.timeline = [];
        this.curItem = null;
        this.prevItem = null;
        this.prevTimeElapsed = 0;            // The time that had elapsed in the experiment when the previous answer was given
        this.thisTimeElapsed = 0;            // The time that had elapsed in the experiment when this answer was selected
        this.correctness = -1;

        /* MTurk */
        this.turkInfo = jsPsych.turk.turkInfo();
		this.workerId = this.turkInfo.outsideTurk ? String(Math.floor(Math.random() * (10000 - 1000) + 1000)) : this.turkInfo.workerId;
        Math.seedrandom(this.workerId);
        
        /* Determine which condition to use */
        const condRand = Math.random();
		if (!condition) {
			var conditions = [constants.CONDITION_FIXED, constants.CONDITION_METTLER, constants.CONDITION_MEMORIZE];
			this.condition = conditions[Math.floor(condRand * conditions.length)];
        }
        
        console.log('Worker ID', this.workerId);
        console.log(this.condition);
    }

    loadMaterials() {
        const self = this;
        $.when(
            $.getJSON(constants.INSTRUCTIONS, (data) => {
                self.instructions = data;
            })
        ).then( () => {
            self.buildTimeline();
            self.run();
        })
    }

    buildTimeline() {
        const noMobile = {
            type: 'pcllab-no-mobile'
        }
        this.timeline.push(noMobile);

        const consent = {
            type: 'pcllab-consent-form',
            consent: true,
            data: {
                period: 'consent form'
            }
        }
        this.timeline.push(consent);

        const demographics = {
            type: 'pcllab-form',
            demographics: true,
            data: {
                period: 'demographics'
            }
        }
        this.timeline.push(demographics);

        var instructions_trial = {
            type: 'pcllab-core',
            stimuli: [this.instructions['start']],
            response_count: 0,
            show_button: true,
            button_text: 'continue',
            data: {
                period: 'instructions'
            }
        }
        this.timeline.push(instructions_trial);

        instructions_trial = {
            type: 'pcllab-core',
            stimuli: [this.instructions['map-task']],
            response_count: 0,
            show_button: true,
            button_text: 'continue',
            data: {
                period: 'instructions'
            }
        }
        this.timeline.push(instructions_trial);

        switch (this.condition) {
            case constants.CONDITION_FIXED:
                this.buildTimelineFixed();
                break;
            case constants.CONDITION_METTLER:
                this.buildTimelineMettler();
                break;
            case constants.CONDITION_MEMORIZE:
                this.buildTimelineMemorize();
                break;
        }


    }

    buildTimelineMettler() {
        mettlerItems = createMettlerItems(africaPaths);         // Create the array with mettler items
        mettlerItems = fisherYatesShuffle(mettlerItems);        // Randomly shuffle that array
        curItem = mettlerItems.shift();                         // The current item will be the first item in the array (highest priority)
        firstTrial = {
            type: TASK,                                         // pcllab-africa-map-task, defined in mettlerFormula.js
            target: curItem.countryName,                    
            feedback: true,
            on_finish: function() {
                console.log(jsPsych.data.getLastTrialData());
                jsPsych.pauseExperiment();
                console.log(mettlerItems);
                var buttonel = document.getElementById('selected');
                if (buttonel.textContent.toLowerCase() == curItem.countryName.toLowerCase()) {
                    correctness = 0;
                } else {
                    correctness = 1;
                }
                thisTimeElapsed = jsPsych.data.getLastTrialData().time_elapsed;             // Get the time elapsed for this item
                var info = getNextMettlerItem(curItem, thisTimeElapsed, prevTimeElapsed, correctness, mettlerItems);          // Get info needed to get next trial. Object containing trial, next item, and array
                var trial = info.trial;
                curItem = info.curItem;
                mettlerItems = info.mettlerItemArr;
                prevTimeElapsed = thisTimeElapsed;          // Set prev time elapsed to this time in order to calc response time for next item
                jsPsych.addNodeToEndOfTimeline({
                    timeline: [trial]
                }, jsPsych.resumeExperiment)
            }
        }
        this.timeline.push(firstTrial);
    }

    buildTimelineFixed() {
        fixedItems = createFixedItems(africaPaths);
        fixedItems = fisherYatesShuffle(fixedItems);
        curItem = fixedItems.shift();
        firstTrial = {
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
                var info = getNextFixedItem(curItem, correctness, fixedItems);
                var trial = info.trial;
                curItem = info.curItem;
                fixedItems = info.fixedItemArr;
                
                jsPsych.addNodeToEndOfTimeline({
                    timeline: [trial]
                }, jsPsych.resumeExperiment)
            }
        }
        this.timeline.push(firstTrial);
    }

    buildTimelineMemorize() {
        memorizeItems = createMemorizeItems(africaPaths);
        memorizeItems = fisherYatesShuffle(memorizeItems);
        curItem = memorizeItems.shift();
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
                var info = getNextMemorizeItem(curItem, correctness, memorizeItems);
                var trial = info.trial;
                curItem = info.curItem;
                memorizeItems = info.memorizeItemArr;

                jsPsych.addNodeToEndOfTimeline({
                    timeline: [trial]
                }, jsPsych.resumeExperiment)
            }
        }
        this.timeline.push(firstTrial);
    }

    run() {
        jsPsych.init({
            display_element: $("div#experiment_container"),
            timeline: this.timeline,
            on_finish:  () => {
                jsPsych.data.addProperties({
                    worker_id: this.workerId,
                    condition: this.condition,
                    timestamp: new Date().toUTCString()
                })
                //jsPsych.data.displayData();

                let myData = jsPsych.data.dataAsJSON() // Data for the experiment
				// $.ajax('https://jarvis.psych.purdue.edu/api/v1/experiments/data/5bf8373244ad5b3318ca6049', {
				// 	data: myData,
				// 	contentType: 'application/json',
				// 	type: 'POST'
				// })

				$('#jspsych-content').css('text-align', 'center');
				$('#jspsych-content').html(`
				    <h2>Thank you for your participation!</h2><br><br>
                    <h1>Survey code: ${constants.TOKEN}</h1><br><br>
				    <a href="debriefing.html" target="_blank">Click here to read about the purpose of this experiment</a>
				    
				`)
				jsPsych.data.localSave('Delayed-Self-Scoring-E3-' + this.workerId + '.csv', 'csv')
            }
        })
    }    





    
}