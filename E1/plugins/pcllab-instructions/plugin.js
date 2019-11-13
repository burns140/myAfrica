/**
 * @name Instructions
 *
 * @param {string} [url=instructions.json] - The address of the json file containing all instructions.
 * @param {object} [instruction_data] - The data for the instructions if not loading from a file.
 * @param {string} [label] - You should provide the label for one instruction or an array of instructions.
 * @param {string} [insert_label] - Selector for element in which to insert additional content.
 * @param {number} [minimum_time] - The minimum time the instructions can be shown
 * @param {number} [maximum_time] - The maximum time for instructions to be shown, will auto continue if set
 * @param {boolean} [hide_button=false] - Hide the continue button or not. Maximum_time must be set
 *
 * @desc This plugin assumes that there is an instructions.json file in the same directory as your experiment file
 * or you need to provide the url to a json file containing all the instructions for the experiment. The structure of
 * the json file is that the root node is an object. Each instruction set has a key and the value is either an object
 * with 'title' and 'text' properties or an array of these objects. As a sample refer to:
 * https://github.com/PCLLAB/Framework/blob/master/tests/instructions.json
 *
 * @author Mehran Einakchi https://github.com/LOG67
 */

jsPsych.plugins["pcllab-instructions"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        // set default values for parameters
        trial.url = trial.url || "instructions.json";
        trial.hide_button = trial.hide_button || false;

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        if (!jsPsych.userInfo) {
            jsPsych.userInfo = {};
        }

        var index = 0;
        var instructions;
        var instructionData;

        //Set background color to white
        var oldBackgroundColor = $('#experiment_container').css('backgroundColor');
        $('#experiment_container').css('backgroundColor', "white");

        if (!jsPsych.userInfo.instructions) {
            if (trial.instruction_data) {
                // Data provided by user directly
                jsPsych.userInfo.instructions = trial.instruction_data;
                instructionData = trial.instruction_data;
                show();
            } else {
                // Load from file
                $.getJSON(trial.url, function (data) {
                    jsPsych.userInfo.instructions = data;
                    instructionData = data;
                    show();
                });
            }
        } else {
            console.log(jsPsych.userInfo.instructions);
            show();
        }

        var continueButton;
        var timerInterval;

        function showNext() {
            display_element.html('<h2 class="text-center">' + instructions[index].title + '</h2><br>');

            // Preference for loading from html file
            if (instructions[index].text_url) {
                const instructionBlock = instructions[index]
                display_element.load(instructionBlock.text_url, function () {
                    // Insert html if needed
                    if (instructionBlock.insert_url) {
                        $(trial.insert_label).load(instructionBlock.insert_url)
                    }

                    display_element.append(continueButton);

                    if (trial.hide_button || trial.minimum_time) {
                        continueButton.hide();
                    }
                });
            } else {
                display_element.append(instructions[index].text + '<br><br>');

                const instructionBlock = instructions[index]
                if (instructionBlock.insert_url) {
                    $(trial.insert_label).load(instructionBlock.insert_url)
                }

                display_element.append(continueButton);
            }
            if (trial.hide_button || trial.minimum_time) {
                continueButton.hide();
            }

            index++;
            continueButton.click(function () {
                done();
            });

            if (trial.minimum_time || trial.maximum_time) {
                var timeElapsed = 0;
                timerInterval = setInterval(function () {
                    timeElapsed += 100;
                    if (trial.minimum_time && timeElapsed == trial.minimum_time) {
                        continueButton.show();
                        if (!trial.maximum_time) {
                            clearInterval(timerInterval);
                        }
                    }
                    if (trial.maximum_time && timeElapsed == trial.maximum_time) {
                        done();
                    }
                }, 100);
            }
        }

        function show() {
            instructions = jsPsych.userInfo.instructions[trial.label];
            if (!$.isArray(instructions)) {
                instructions = [instructions];
            }

            continueButton = $('<button>', {
                class: 'btn btn-primary btn-lg pcllab-button-center waves-effect waves-light',
                text: 'Continue',
            });

            showNext();

        }

        function done() {
            clearInterval(timerInterval);
            if (index != instructions.length) {
                showNext();
            } else {
                display_element.html("");
                $('#experiment_container').css('backgroundColor', oldBackgroundColor);
                jsPsych.finishTrial();
            }
        }
    };



    return plugin;
})();
