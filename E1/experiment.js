/**
 * Experiment Name
 * Experiment Session
 * 
 * Author
 */

EXPERIMENT_NAME = "Experiment-E1"

// Experiment specific constants
// Easily change values across the experiment.
CONSTANTS = {
    study_prompt: 'Study these pictures',
    study_maximum_time: 5000,
}

// Maps file data to variables
// Example: 
// 'file.json': stimuli
// accessed as this.stimuli later on
EXPERIMENT_FILES = {
    'instructions.json': 'instructions'
}

// URL parameters that are REQUIRED for this experiment to run
URL_PARAMS = ['condition', 'workerId', 'session', 'set']

// Put experiment jarvis ID here
EXPERIMENT_ID = ''
DOWNLOAD_CSV = true // Enable to download experiment CSV

class Experiment {
    /**
     * Constructor: initialize experiment variables and start the experiment
     */
    constructor() {
        this.rawStimuli = null
        this.instructions = {}
        this.timeline = []

        this.loadMaterials()
    }

    /**
     * Assign experiment counterbalancing parameters from URL coditions
     */
    counterbalance() {

        // Retrieve URL data and check if required params are there, shouldn't need to modify
        this.urlData = jsPsych.data.urlVariables()
        URL_PARAMS.forEach(
            param => !this.urlData[param] ? window.location.replace("lab-start.html") : null
        )
        window.history.pushState({}, document.title, window.location.pathname)

        // Assign user data (if needed)
        this.userData = {
            subject: this.urlData.workerId,
            session: this.urlData.session,
            condition: this.urlData.condition
        }

        // Place any logic used for counterbalancing below

    }

    /**
     * Perform any needed stimuli data parsing before building the timeline
     */
    parseStimuli() {
        
    }

    /**
     * Automatically loads the materials into the experiment from EXPERIMENT_FILES defined above.
     */
    loadMaterials() {
        $.when( // Do not modify unless you know what you are doing
            ...Object.keys(EXPERIMENT_FILES).map(file =>
                $.getJSON(file, data => {
                    this[EXPERIMENT_FILES[file]] = data
                })
            )
        ).then(() => {
            console.log(this)
            this.counterbalance()
            this.buildTimeline()
            this.run()
        })
    }

    /**
     * Build the experiment timeline from experiment plugins
     */
    buildTimeline() {
        this.parseStimuli();

        const browser = {
            type: 'pcllab-browser'
        }

        const instructionsStudy = {
            type: 'pcllab-core',
            stimuli: [this.instructions['study']],
            show_button: true,
            response_count: 0,
        }

        // Assign timeline here
        this.timeline = [
            browser,
            instructionsStudy
        ]

    }
 
    /**
     * Runs experiment, shouldn't need to modify
     */
    run() {
        jsPsych.init({
            display_element: $("div#experiment_container"),
            timeline: this.timeline,
            on_finish: () => {
                this.done()
            }
        })
    }

    /**
     * Runs when experiment is done, save experiment data and display done message
     */
    done() {
        const data = jsPsych.data.dataAsJSON()
        console.log(JSON.parse(data))

        // Save to jarvis if ID provided at the top
        if(EXPERIMENT_ID && EXPERIMENT_ID.length > 0) {
            $.ajax(`https://jarvis.psych.purdue.edu/api/v1/experiments/data/${EXPERIMENT_ID}`, {
                data,
                contentType: 'application/json',
                type: 'POST'
            })
        }
        if(DOWNLOAD_CSV) {
            jsPsych.data.localSave(`${EXPERIMENT_NAME}-${this.userData.subject}-${this.userData.session}.csv`, 'csv')
        }

        // Format done page

        const doneArea = document.createElement('div')
        doneArea.innerHTML = `
            <h2>Thank you for your participation!</h2>
            <p>Please remain seated quietly until everyone else is finished.</p>
        `
        document.getElementById('jspsych-content').appendChild(doneArea);
    }
}