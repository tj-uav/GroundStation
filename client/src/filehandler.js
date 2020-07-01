//import listReactFiles from 'list-react-files'

const load = filetype => {
	console.log("Loading " + filetype)
	return [
		[50, 60],
		[70, 80],
	]
}

const save = (filename, data) => {
	console.log("Saving " + data + " to " + filename)
	const element = document.createElement("a")
	const file = new Blob([data], { type: "text/plain" })
	element.href = URL.createObjectURL(file)
	element.download = filename
	document.body.appendChild(element) // Required for this to work in FireFox
	element.click()
}

export { load, save }
