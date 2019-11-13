jsPsych.plugins["pcllab-show-html"] = (function () {

	var plugin = {};

	plugin.trial = function (display_element, trial) {
		const $displayElement = $(display_element)
		const startTime = Date.now()

		$displayElement.empty()
		$contentRow = $('<div>', {
			class: 'row m-0 p-0'
		})
		$contentCol = $('<div>', {
			class: 'col m-0 p-0'
		})

		$displayElement.append($contentRow)
		$contentRow.append($contentCol)

		if (trial.content_callback) {
			$contentCol.append(trial.content_callback())
		} else {
			$contentCol.append(trial.content)
		}

		$buttonRow = $('<div>', {
			class: 'row m-0 mt-4 p-0 justify-content-center'
		})
		$button = $('<button>', {
			text: 'Next',
			class: 'btn btn-lg btn-primary waves-effect waves-light'
		})

		$button.click(() => {
			$displayElement.empty()
			jsPsych.finishTrial({
				rt: Date.now() - startTime
			})
		})

		$displayElement.append($buttonRow)
		$buttonRow.append($button)
	}

	return plugin
})()