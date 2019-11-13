const africaPaths = require('../js/africa-paths')

module.exports.buildTemplate = (self) => {
    self.$title = $(`
			<div class="row justify-content-center">
				<h1>${self.title}</h1>
			</div>
		`)
    self.$displayElement.append(self.$title)

    self.$displayElement.append(`
			<div class="row mt-4 mb-4">
				<div class="col" id="trial_container"></div>
			</div>
		`)
    self.$trialContainer = $('#trial_container')

    const $trialContainerRow = $('<div>', { class: 'row' })
    self.$trialContainer.append($trialContainerRow)

    self.$mapContainer = $('<div>', { class: 'col-6 text-center' })
    $trialContainerRow.append(self.$mapContainer)

    self.$responseContainer = $('<div>', { class: 'col-6' })
    $trialContainerRow.append(self.$responseContainer)

    self.$feedbackContainer = $('<div>', { class: 'row' })
    self.$displayElement.append(self.$feedbackContainer)

    self.$displayElement.append(`
			<div class="row">
				<div class="col text-center" id="button_container"></div>
			</div>
		`)
    self.$buttonContainer = $('#button_container')

    self.$nextButton = $('<button>', {
        class: 'btn btn-lg btn-primary waves-effect waves-light',
        text: self.buttonText
    })
    self.$nextButton.click(self.clickNext())
    self.$buttonContainer.append(self.$nextButton)
}

module.exports.loadMap = (self) => {
    self.R = Raphael(self.$mapContainer[0], 600, 670)
    const attr = {
        "fill": "#BDBDBD",
        "stroke": "#fff",
        "stroke-miterlimit": "4",
        "stroke-width": "1",
        "transform": "s0.055,0.055,55,0" // Scales the path to a useful size.
    }

    // Define map object. 
    const africaMap = {}
    for (var nation in africaPaths) {
        // Draw a path, then apply attributes to it.
        africaMap[nation] = self.R.path(africaPaths[nation]).attr(attr)
        // Name the internal Raphael id after the africaPaths property name.
        africaMap[nation].id = nation
        // Name the element id after the africaPaths property name.
        africaMap[nation].node.id = nation
    }
}

module.exports.loadResponseButtons = (self) => {
    self.$responseContainer.append($(`
        <div class="row">
            <h5 class="w-100 text-center">Choose the name of the highlighted country</h5>
        </div>
    `))

    const $buttonRow = $('<row>', { class: 'row pr-2' })
    self.$responseContainer.append($buttonRow)

    for (const nation of Object.keys(africaPaths).sort()) {
        let buttonName = nation.split('_').join(' ')
        const $buttonCol = $('<col>', { class: 'col-4 p-1 m-0' })
        const $responseButton = $('<button>', {
            class: 'response-button btn btn-flat-primary waves-effect waves-primary w-100 h-100 m-0 p-1',
            style: 'border: 1px solid #2196F3',
            text: buttonName,
            id: `${buttonName}-label`
        })
        $buttonCol.append($responseButton)
        $buttonRow.append($buttonCol)

        $responseButton.click(self.selectNation())
    }
}