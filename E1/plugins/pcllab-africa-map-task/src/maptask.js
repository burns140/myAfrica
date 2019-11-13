require('../js/raphael')

/* Util functions */
const setParameter = require('./util').setParameter
const setFullscreen = require('./util').setFullscreen
const unsetFullscreen = require('./util').unsetFullscreen

/* Template functions */
const buildTemplate = require('./template').buildTemplate
const loadMap = require('./template').loadMap
const loadResponseButtons = require('./template').loadResponseButtons

class MapTask {
    constructor(display_element, trial) {

        // Stimulus parameters
        this.target = setParameter(trial.target, '', 'string')
        this.title = setParameter(trial.title, '', 'string')
        this.buttonText = setParameter(trial.button_text, 'Next', 'string')
        this.feedback = setParameter(trial.feedback, true, 'boolean')
        this.forcedResponse = setParameter(trial.forced_response, true, 'boolean')

        // Template Properties
        this.$displayElement = $(display_element)
        this.$trialContainer = $()
        this.$mapContainer = $()
        this.$responseContainer = $()
        this.$title = $()
        this.$buttonContainer = $()
        this.$feedbackContainer = $()
        this.$nextButton = $()

        // Internal Properties
        this.R = null
    }

    start() {
        setFullscreen()
        buildTemplate(this)
        loadMap(this)
        loadResponseButtons(this)

        const target = this.target.toLowerCase().split(' ').join('_')
        this.R.getById(target).attr({ "fill": "#2196F3" })

        if (this.forcedResponse) {
            this.$nextButton.attr('disabled', true)
        }
    }

    selectNation() {
        const self = this
        return function () {
            const target = self.target.toLowerCase().split('_').join(' ')
            const response = $(this).text().toLowerCase().split('_').join(' ')

            $('.response-button').attr('disabled', true)
            $('.response-button').css('border', '1px solid #9E9E9E')

            $('.response-button').each(function () {
                const $button = $(this)
                if ($button.text().toLowerCase() === response) {
                    $button.css('pointer-events', 'none')
                    $button.removeClass('btn-flat-primary')
                    $button.addClass('btn-flat-danger')
                    $button.css('border', '1px solid #f44336')
                    $button.attr('disabled', false)
                    $button.attr('id', 'selected');
                }

                if ($button.text().toLowerCase() === target) {
                    $button.css('pointer-events', 'none')
                    $button.removeClass('btn-flat-primary')
                    $button.addClass('btn-flat-success')
                    $button.css('border', '1px solid #4CAF50')
                    $button.attr('disabled', false)
                }
            })

            if (self.feedback) {
                self.$feedbackContainer.append(
                    $('<h5>', {
                        class: 'w-100 text-center',
                        text: `The correct answer is ${self.target}`,
                        id: 'ans-label'
                    })
                )
            }

            self.$nextButton.attr('disabled', false)
        }
    }

    clickNext() {
        return () => {
            jsPsych.finishTrial({})
            unsetFullscreen()
            this.$displayElement.empty()
        }
    }
}

module.exports = MapTask