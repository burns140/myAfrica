/**
 * @name Demographics
 *
 * @desc Provides text input for age and gender, and radio button for whether english is the experimentee's first language. It
 * also checks that the age is a number between 0 and 125, there is a value for gender and the English question is answered.
 *
 * @data {"demo_age":25, "demo_gender":"female", "demo_english":"yes"}
 *
 * @author Mehran Einakchi https://github.com/LOG67
 * @author Vishnu Vijayan https://github.com/vi-v
 */

jsPsych.plugins["pcllab-demographics"] = (function () {

    var plugin = {};

    plugin.trial = function (display_element, trial) {

        trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

        display_element.empty()

        display_element.load('plugins/pcllab-demographics/template.html', function () {

            $("#rb1").click(function () {
                $('#language_opt').prop('disabled', true)
                $('#language_opt_form').slideUp(100)
            })

            $("#rb2").click(function () {
                $('#language_opt').prop('disabled', false)
                $('#language_opt_form').slideDown(100)
            })

            $('input[id=age_demo]').on('input', function () {
                var age = $(this).val();
                
                if (isNaN(age) || age < 0 || age > 125) {
                    $(this).parent().removeClass('has-success')
                    $(this).parent().addClass('has-danger')
                } else {
                    $(this).parent().addClass('has-success')
                    $(this).parent().removeClass('has-danger')
                }
            })

            $("#continue_btn").click(function () {
                var data = {};

                var ageInput = $('input[id=age_demo]');
                var age = $('input[id=age_demo]').val();
                age = parseInt(age);
                console.log(!isNaN(age) && (age < 0 || age > 125) )
                if (isNaN(age) || age < 0 || age > 125) {
                    ageInput.parent().addClass('has-danger')
                    return;
                }
                jsPsych.data.write({
                    'question': 'age',
                    'response': age
                })


                var gender = $('input[id=gender_demo]').val();
                if (!gender || !gender.trim()) {
                    return;
                }
                jsPsych.data.write({
                    'question': 'gender',
                    'response': gender
                })

                data['question'] = 'language'
                if ($("#rb1").is(":checked")) {
                    data['response'] = $('input:radio:checked[name=english_demo]').val();
                } else {
                    var lang = $('#language_opt').val();
                    data['response'] = lang;
                    if (!lang || !lang.trim()) {
                        return;
                    }
                }

                /* This is a workaround to an issue with form submission in new browsers */
                const form = $('form')
                form.hide()
                $(document.body).append(form)

                display_element.html("");
                jsPsych.finishTrial(data);
            });
        })

    };

    return plugin;
})();
