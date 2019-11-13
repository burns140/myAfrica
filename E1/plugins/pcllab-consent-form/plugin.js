/**
 * @name Consent Form
 *
 * @param {string} [url=consent.html] - The address of the consent html form.
 *
 * @desc Your consent.html file or the file at the path provided using 'url' should be a partial html, i.e., no html or
 * head or body tags just child tags like <p>. This plugin will added the consent checkbox and 'start experiment' button, so
 * you don't need to put those in your consent.html file.
 *
 * @author Mehran Einakchi https://github.com/LOG67
 */

jsPsych.plugins["pcllab-consent-form"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        // set default values for parameters
        trial.url = trial.url || "consent.html";

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);


        display_element.load(trial.url, function () {
            display_element.append('<br><h4>To continue, click the checkbox below and hit "Start Experiment".</h4> ' +
                '<div class="form-check pl-0"><input id="cb1" class="form-check-input" type="checkbox"><label for="cb1" style="font-size: larger;">I agree to take part in this study.</label></div><br>' +
                '<button id="continue_btn" class="btn btn-primary btn-lg pcllab-button-center waves-effect waves-light">Start Experiment</button>');

            $('#continue_btn').click(function () {
                if (!$('input[type=checkbox]').prop("checked")) {
                    alert("You need to read and accept the Consent Form to start the experiment. Check the agreement box.");
                } else {
                    display_element.html("");
                    jsPsych.finishTrial();
                }
            });
        })
    };

    return plugin;
})();
