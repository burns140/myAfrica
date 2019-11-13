

module.exports.setParameter = (value, defaultValue, expectedType) => {
    if (typeof value === "function" && typeof value !== expectedType) {
        value = value()
    }

    if (expectedType && typeof value === expectedType) {
        return value
    }

    if (typeof value !== 'undefined') {
        return value
    }

    return defaultValue
}

let oldStyles = {}
module.exports.setFullscreen = () => {
    const $experimentContainer = $('#experiment_container')

    // Save old styling
    oldStyles['max-width'] = $experimentContainer.css('max-width')
    oldStyles['width'] = $experimentContainer.css('width')
    oldStyles['margin'] = $experimentContainer.css('margin')
    oldStyles['padding'] = $experimentContainer.css('padding')
    oldStyles['min-height'] = $experimentContainer.css('min-height')
    oldStyles['height'] = $experimentContainer.css('height')

    // Apply new styling
    $experimentContainer.css('max-width', 'none')
    $experimentContainer.css('width', '100%')
    $experimentContainer.css('margin', '0')
    $experimentContainer.css('padding', '1em')
    $experimentContainer.css('min-height', 'none')
    $experimentContainer.css('height', '100vh')
}

module.exports.unsetFullscreen = () => {
    const $experimentContainer = $('#experiment_container')

    // Reset old styling
    for (let style in oldStyles) {
        $experimentContainer.css(style, oldStyles[style])
    }
}