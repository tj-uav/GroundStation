import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const grid = 8;

// fake data generator
const getItemsList = (mode, data, display) => {
  console.log(data.length);
  if(data.length == 0){
    return [];
  }
  let ret = [];
  switch(mode){
      case 'waypoints':
      case 'fence':
          for(let idx in data){
              let sigfig = [data[idx][0].toFixed(3), data[idx][1].toFixed(3)];
              let displayIdx = parseInt(idx)+1;
              ret.push({id: idx, content: display[mode] + " " + displayIdx + ": " + sigfig[0] + ", " + sigfig[1]});
          }
          break;
      case 'polygons':
          for(let idx in data){
              let polygon = data[idx];
              console.log(polygon);
              for(let subidx in polygon){
                  console.log(polygon[subidx]);
                  let sigfig = [polygon[subidx][0].toFixed(3), polygon[subidx][1].toFixed(3)];
                  ret.push({id: idx, content: "Polygon " + (parseInt(idx)+1) + ", marker " + (parseInt(subidx)+1) + ": " + sigfig[0] + ", " + sigfig[1]});
              }
          }
          break;
      }
  console.log(ret);
  return ret;
}


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
  return props.state.map((item, index) => (
    <DisplayItem item={item} index={index}></DisplayItem>
  ))
}


const ToolbarList = (props) => {

//  const state = useRef([]);
//  let [state, setState] = useState([]);

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    const items = reorder(props.data, result.source.index, result.destination.index);
    console.log(items);
    props.setData(items);
    console.log(props.data);
//    state.current = items;
//    const items = reorder(state, result.source.index, result.destination.index);
//    state.current = items;
//    setState(items);
  }

  useEffect(() => {
//    setState(getItemsList(props.mode, props.data, props.display));
//    state.current = getItemsList(props.mode, props.data, props.display);
//    console.log(state);
  }, [props.data])

  return (
    <div>
      {/* {state.current.length} */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{background: snapshot.isDraggingOver ? "lightblue" : "lightgrey", padding: grid, width: 250}}
            >
{/*            <DisplayList state={state.current}></DisplayList> */}
            <DisplayList state={getItemsList(props.mode, props.data, props.display)}></DisplayList>
            {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
    );
  }


// Put the thing into the DOM!
export default ToolbarList;