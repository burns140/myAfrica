/**
 * @name No Mobile
 *
 * @desc If the experimentee is using a mobile device this plugin will show a message and halts the experiment.
 *
 * @author Mehran Einakchi https://github.com/LOG67
 */

jsPsych.plugins["pcllab-no-mobile"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        if (!isMobile()) {
            display_element.html("");
            jsPsych.finishTrial();
            return;
        }

        display_element.html('<div style="text-align: center;"> ' +
            '<h2>No Mobile Devices</h2><br> ' +
            '<p>In order to receive credit for this HIT you must use a desktop or laptop computer. ' +
            'The experiment does not work on mobile or tablet devices.</p> ' +
            '<p>If you would still like to participate please go back to ' +
            'Mturk on a capable device and click the link.</p> ' +
            '</div>');
    };

    function isMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return true;
        } else {
            return false;
        }
    }

    return plugin;
})();
