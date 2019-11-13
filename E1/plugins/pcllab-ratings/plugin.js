/**
 * @name Ratings
 *
 * @param {string} title - This title will appear above the plugin.
 * @param {string} instructions - The text for the instructions header
 * @param {string} description - The text for the description
 * @param {string=Continue} button_text - Text that will appear on the 'continue' button.
 * @param {boolean} vertical - Shows the likert scale vertically
 * @param {number} label_width - Force the radio labels to be a certain width
 * @param {boolean} [slider=false] - If set to true, use a slider instead of a likert scale
 * @param {number} minimum_time - Minimum amount of milliseconds allowed for the user to continue.
 * @param {number} maximum_time - Maximum amount of milliseconds allowed for the user to continue.
 * @param {string=} output - The answers given are stored in the constiable provided here.
 *
 * @author Andrew Arpasi, Vishnu Vijayan
 */

jsPsych.plugins["pcllab-ratings"] = (function () {

  var plugin = {}

  plugin.trial = function (display_element, trial) {

    if (trial.trialUrl) {
      $.getJSON(trial.trialUrl, data => {
        let trialData = data[trial.label]

        trialData = jsPsych.pluginAPI.evaluateFunctionParameters(trialData)

        // Default trial parameters
        trialData.title = trialData.title || ""
        trialData.button_text = trialData.button_text || "Continue"
        trialData.scale = trialData.scale || ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",]
        trialData.instructions = trialData.instructions || ""
        trialData.description = trialData.description || ""

        loadQuestion(trialData)
      })
    } else {
      trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial)

      // Default trial parameters
      trial.title = trial.title || ""
      trial.button_text = trial.button_text || "Continue"
      trial.scale = trial.scale || ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",]
      trial.instructions = trial.instructions || ""
      trial.description = trial.description || ""

      loadQuestion(trial)
    }

    function loadQuestion(trialData) {

      let startTime = (new Date()).getTime()
      let firstInteractionTime
      let data = []
      let likertValue = -1

      if (trial.title) {
        trialData.title = trial.title
      }

      const template = $('<div>', {
        class: "pcllab-template text-center"
      })

      template.append("<h2 style='text-align: center; padding-bottom: 12px'>" + trialData.title + "</h2>")

      // Button
      const buttonContainer = $('<div>', {
        class: "pcllab-button-container"
      })

      const button = $('<button>', {
        id: "continue-button",
        class: "btn btn-primary btn-lg waves-effect waves-light",
        text: trialData.button_text
      })

      buttonContainer.append(button.on('click', function () {
        const data = {
          response: likertValue,
          response_time: Date.now() - startTime,
          identifier: trial.identifier
        }
        finishTrial(data)
      }))

      button.prop('disabled', true)

      if (trialData.instructions) {
        const instructionsLabel = $('<h4>', {
          text: trialData.instructions
        })
        instructionsLabel.css({
          'text-align': 'center',
          'margin': '30px 0',
        })
        template.append(instructionsLabel)
      }

      if (trialData.description) {
        const descriptionPane = $('<div>', {
          html: trialData.description
        })
        descriptionPane.css({
          'text-align': 'center',
          'margin-top': '10px',
        })
        template.append(descriptionPane)
      }

      if (!trialData.slider) {
        const buttonGroup = $('<div>', {
        })
        buttonGroup.css({
          'margin': 'auto',
          'text-align': 'center',
        })

        const addRadioButton = (value) => {
          const uuid = guid()

          const formGroup = $('<div>', {
            class: 'md-radio'
          })

          if (trial.vertical) {
            formGroup.addClass('md-radio')
          } else {
            formGroup.addClass('md-radio-inline')
          }

          const radioLabel = $('<label>', {
            for: uuid,
            text: `${value}`
          })
          radioLabel.css({
            'display': 'inline-block',
            'margin': '0 1%',
            'font-size': '1rem',
            'text-align': 'left',
            'width': trial.label_width,
            'padding': '0 15px 0 22px'
          })
          const radioButton = $('<input>', {
            type: 'radio',
            name: 'rating',
            id: uuid,
            value: `${value}`,
          })
          radioButton.change((event) => {
            likertValue = event.currentTarget.value
            button.prop('disabled', false)
          })
          formGroup.append(radioButton)
          formGroup.append(radioLabel)
          buttonGroup.append(formGroup)
        }

        trialData.scale.forEach(value => addRadioButton(value))

        template.append(buttonGroup)
      }

      template.append(buttonContainer)

      display_element.append(template)
    }

    function finishTrial(data) {

      display_element.html('')

      jsPsych.finishTrial(data)
    }
  }

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  return plugin
})()