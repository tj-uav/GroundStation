import React, { useState, useEffect, useRef } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

const grid = 5

// fake data generator
const getItemsList = (mode, data, display) => {
	if (data.length === 0) {
		return []
	}
	let ret = []
	switch (mode) {
		case "waypoints":
		case "fence":
			for (let idx in data) {
				let sigfig = [data[idx][0].toFixed(3), data[idx][1].toFixed(3)]
				let displayIdx = parseInt(idx) + 1
				ret.push({
					id: idx,
					content: display[mode] + " " + displayIdx + ": " + sigfig[0] + ", " + sigfig[1],
				})
			}
			break
		case "polygons":
			for (let idx in data) {
				let polygon = data[idx]
				//              console.log(polygon);
				let temp = []
				for (let subidx in polygon) {
					//                  console.log(polygon[subidx]);
					let sigfig = [polygon[subidx][0].toFixed(3), polygon[subidx][1].toFixed(3)]
					temp.push({
						id: idx,
						content:
							"Polygon " +
							(parseInt(idx) + 1) +
							", marker " +
							(parseInt(subidx) + 1) +
							": " +
							sigfig[0] +
							", " +
							sigfig[1],
					})
				}
				ret.push(temp)
			}
			break
	}
	console.log(ret)
	return ret
}

const DisplayItem = props => (
	<Draggable key={props.item.id} draggableId={props.item.id} index={props.index}>
		{(provided, snapshot) => (
			<div
				ref={provided.innerRef}
				{...provided.draggableProps}
				{...provided.dragHandleProps}
				style={{
					userSelect: "none",
					padding: grid * 2,
					margin: `0 0 ${grid}px 0`,
					background: snapshot.isDragging ? "lightgreen" : "grey",
					...provided.draggableProps.style,
				}}
			>
				{props.item.content}
			</div>
		)}
	</Draggable>
)

const DisplayList = props => {
	console.log(props.state)
	return props.state.map((item, index) => <DisplayItem item={item} index={index}></DisplayItem>)
}

const getDisplayList = (mode, data, display) => {
	let items = getItemsList(mode, data, display)
	console.log(items)
	if (mode === "polygons") {
		console.log("Hai")
		return items.map((polygon, idx) => <DisplayList state={polygon}></DisplayList>)
	} else {
		return <DisplayList state={items}></DisplayList>
	}
}

const ToolbarList = props => {
	const reorder = (list, startIndex, endIndex) => {
		const result = Array.from(list)
		const [removed] = result.splice(startIndex, 1)
		result.splice(endIndex, 0, removed)
		return result
	}

	const onDragEnd = result => {
		// dropped outside the list
		if (!result.destination) {
			return
		}
		const items = reorder(props.data, result.source.index, result.destination.index)
		props.setData(items)
	}

	return (
		<div>
			<DragDropContext onDragEnd={onDragEnd}>
				<Droppable droppableId="droppable">
					{(provided, snapshot) => (
						<div
							{...provided.droppableProps}
							ref={provided.innerRef}
							style={{
								background: snapshot.isDraggingOver ? "lightblue" : "lightgrey",
								padding: grid,
								width: 250,
							}}
						>
							{getDisplayList(props.mode, props.data, props.display)}
							{provided.placeholder}
						</div>
					)}
				</Droppable>
			</DragDropContext>
		</div>
	)
}

export default ToolbarList
