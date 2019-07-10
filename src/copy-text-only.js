const UI = require('sketch/ui')
const { selectedLayers } = require('sketch/dom').getSelectedDocument()
const pasteBoard = NSPasteboard.generalPasteboard()
// documentation: https://developer.sketchapp.com/reference/api/

// Set selectedText array.
let GetAllSelectedText = []

// Set selectedText Properties.
const SetSelectedTextProperties = (layer) => {
	return GetAllSelectedText.push({
		'x': layer.sketchObject.absoluteRect().rulerX(),
		'y': layer.sketchObject.absoluteRect().rulerY(),
		'text': layer.text
	})
}

// Loop through all selected layers.
const loopThroughAllSelectedLayers = (layers) => {
	layers.forEach( layer => {
		// If selected layer is a "text" layer
		if ( layer.type === 'Text' ) {
			// Add the results to an array of objects with this new values.
			return SetSelectedTextProperties(layer);
		} else if ( ( layer.type === 'Group' || layer.type === 'Artboard' ) && 'layers' in layer ) {
			// If it's a "group" OR "artboard" layer: Run the loop again.
			return loopThroughAllSelectedLayers(layer.layers)
		}
	})
}

/**
 * Default function.
 */
export default function() {
	// If there are layers selected.
	if ( selectedLayers.length > 0 ) {
		// Clear clipboard content.
		pasteBoard.clearContents()

		// Loop through all layers.
		loopThroughAllSelectedLayers(selectedLayers)

		// If text layers were found.
		if ( GetAllSelectedText.length > 0 ) {
			// Sort array by coordinates.
			GetAllSelectedText.sort((a, b) => ( a.y == b.y ? a.x - b.x : a.y - b.y ))

			// Go through all selected text layers.
			GetAllSelectedText.forEach((item, i, array) => {
				// Copy text to clipboard (Adding a new line at the end EXCEPT for the last item).
				pasteBoard.writeObjects([`${item.text}${i !== array.length - 1 ? '\n' : ''}`])
			})

			// Let user know that text was copied to clipboard.
			UI.message(`Text copied to clipboard! 😉`)
		} else {
			// Let user know there are not layers/artboards with text selected.
			UI.message(`Please select layers/artboards with text 😧`)
		}
	} else {
		// Let user know there are not layers selected.
		UI.message(`Nothing was selected 😧`)
	}
}
