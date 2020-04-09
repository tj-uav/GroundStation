import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// fake data generator
const getItems = (count) => {
  return Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: `item ${k}`
  }));
}
// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const DisplayItem = (props) => (
  <Draggable key={props.item.id} draggableId={props.item.id} index={props.index}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        style={{userSelect: "none", padding: grid * 2, margin: `0 0 ${grid}px 0`,
          background: snapshot.isDragging ? "lightgreen" : "grey",
          ...provided.draggableProps.style
        }}
      >
      {props.item.content}
      </div>
    )}
  </Draggable>
)

const DisplayList = (props) => {
  return props.state.items.map((item, index) => (
    <DisplayItem item={item} index={index}></DisplayItem>
  ))
}


const ToolbarList = (props) => {
  let [state, setState] = useState({items: getItems(20)})

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      state.items,
      result.source.index,
      result.destination.index
    );

    setState({items});
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{background: snapshot.isDraggingOver ? "lightblue" : "lightgrey", padding: grid, width: 250}}
            >
            <DisplayList state={state}></DisplayList>
            {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }


// Put the thing into the DOM!
export default ToolbarList;