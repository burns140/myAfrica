const MapTask = require('./maptask')

jsPsych.plugins["pcllab-africa-map-task"] = (function () {
    let plugin = {}

    plugin.info = {
        name: 'pcllab-africa-map-task',
        parameters: {}
    }

    plugin.trial = function (display_element, trial) {
        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial)

        const maptask = new MapTask(display_element, trial)
        maptask.start()
    }

    return plugin
})()