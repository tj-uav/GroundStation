import React, { useState, useEffect, useMemo, useRef, useCallback } from "react"
import regexParse from "regex-parser"

import { Row, Column } from "components/Containers"
import { Button, Box, Label } from "components/UIElements"
import { red } from "theme/Colors"

import Param from "./Param"
/*
Current params functionality:
You can load a param file, and it will load all known params (known params are those in the paramDescriptions dictionary).
You can also save the current params to a file.
The params file format is the same as that of MP.

TODO: Make params table editable (look at list of useful react components in #ground-station)
TODO: Allow reader to choose location when saving params file
TODO: Put in all the param descriptions
TODO: Read params from mavlink
TODO: Write params to mavlink
*/

const INITIAL_PARAMS = Object.entries(require("parameters.json")).map(
	([name, { description, link }]) => ({
		name,
		description,
		link,
		value: "0",
	})
)

const ParametersContext = React.createContext(undefined)
export function useParameters() {
	const context = React.useContext(ParametersContext)
	if (context === undefined)
		throw new Error("Parameters context can only be called inside a child on `Params`.")
	return context.current
}

const increment = 50

const Params = () => {
	const [range, setRange] = useState([0, increment])
	const [count, setCount] = useState(0)

	const incrementRange = useCallback(() => {
		return setRange(([low, high]) => [
			Math.min(low + increment, count),
			Math.min(high + increment, count),
		])
	}, [count])

	const decrementRange = useCallback(() => {
		return setRange(([low, high]) => [
			Math.max(low - increment, 0),
			Math.max(high - increment, 0),
		])
	}, [])

	const [filter, setFilter] = useState(/.*/gi)
	const [loading, setLoading] = useState(false)

	const scrollArea = useRef(null)
	const [incrementButton, setIncrement] = useState(null)
	const [decrementButton, setDecrement] = useState(null)

	const load = useCallback(
		fn => {
			setLoading(true)
			const old = scrollArea.current.style.overflow
			scrollArea.current.style.overflow = "hidden"
			if (fn === undefined) {
			} else if (fn === incrementRange) {
				scrollArea.current.scrollTop = 48
			} else if (fn === decrementRange) {
				// hack to get scrollBottom equivalent
				scrollArea.current.scrollTop = Number.MAX_SAFE_INTEGER
				scrollArea.current.scrollTop -= 96
			}
			fn()
			setLoading(false)
			scrollArea.current.style.overflow = old
		},
		[incrementRange, decrementRange, scrollArea]
	)

	useEffect(() => {
		const el = incrementButton
		const observer = new IntersectionObserver(entries => {
			const visible = entries[0].intersectionRatio > 0
			if (visible) load(incrementRange)
		})
		if (el) observer.observe(el)
		return () => observer.disconnect()
	}, [incrementButton, load, incrementRange])

	useEffect(() => {
		const el = decrementButton
		const observer = new IntersectionObserver(entries => {
			const visible = entries[0].intersectionRatio > 0
			if (visible) load(decrementRange)
		})
		if (el) observer.observe(el)
		return () => observer.disconnect()
	}, [decrementButton, load, decrementRange])

	const [activeParamIndex, setActiveIndex] = useState()
	const [modifiedIndexes, setModifiedIndexes] = useState([])
	const parameters = useRef(new Array(INITIAL_PARAMS))
	const paramsElementList = useMemo(() => {
		const arr = INITIAL_PARAMS.filter(
			p => filter.test(p.name) || filter.test(p.description)
		).map((param, i) => (
			<Param
				key={i}
				index={i}
				data={param}
				active={i === activeParamIndex}
				setActiveIndex={setActiveIndex}
				setModifiedIndexes={setModifiedIndexes}
			/>
		))
		setCount(arr.length)
		return arr.length <= increment * 2 ? arr : arr.slice(...range)
	}, [range, filter, activeParamIndex])

	const inputBox = useRef(null)

	return (
		<ParametersContext.Provider value={parameters}>
			<div
				style={{
					display: "grid",
					padding: "1rem 1rem 0 1rem",
					gridTemplateColumns: "37rem 100fr",
					gap: "1rem",
					width: "100%",
					height: "auto",
					overflowY: "auto",
				}}
			>
				<div>
					<Row height="3rem">
						<Button>Read</Button>
						<Button
							onClick={() => {
								// TODO send to the backend
								console.log(
									parameters.current.filter((_, i) => modifiedIndexes.includes(i))
								)
							}}
						>
							Write
						</Button>
						<Button>Load</Button>
						<Button>Save</Button>
					</Row>
					{modifiedIndexes.length > 0 && (
						<Row
							style={{ marginTop: "1rem" }}
							columns="min-content auto 6rem"
							height="2rem"
						>
							<Row columns="14rem 6rem">
								<Label>Param Name</Label>
								<Label>Value</Label>
							</Row>
							<Label>Description</Label>
						</Row>
					)}
					<section
						style={{
							display: "flex",
							flexDirection: "column",
							flexGrow: "1",
							rowGap: "1rem",
							overflow: "auto",
						}}
					>
						{modifiedIndexes.map((mIndex, index) => (
							<Param
								key={index}
								index={mIndex}
								data={parameters.current[mIndex]}
								active={false}
								setActiveIndex={setActiveIndex}
								setModifiedIndexes={setModifiedIndexes}
								modified={true}
							/>
						))}
					</section>
				</div>
				<Column
					height="100%"
					style={{ overflow: "auto", display: "flex", flexDirection: "column" }}
				>
					<Row height="3rem" columns="auto">
						<Box
							ref={inputBox}
							onKeyDown={e => {
								if (e.nativeEvent.key === "Enter") e.preventDefault()
								e.stopPropagation()
							}}
							onChange={value => {
								let regex
								const element = inputBox.current
								element.style.color = "unset"
								try {
									regex = regexParse(value)
								} catch (e) {
									regex = /.*/gi
									if (value !== "") element.style.color = red
								}
								setFilter(regex)
								setRange([0, increment])
								scrollArea.current.scrollTop = 0
							}}
							placeholder="Enter search term or regular expression"
							style={{ textAlign: "left" }}
							editable
						></Box>
					</Row>
					<Row
						style={{ marginBottom: "-1rem" }}
						columns="min-content auto 6rem"
						height="2rem"
					>
						<Row columns="14rem 6rem">
							<Label>Param Name</Label>
							<Label>Value</Label>
						</Row>
						<Label>Description</Label>
					</Row>
					<div ref={scrollArea} style={{ overflow: "auto" }}>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
								gap: "1rem",
							}}
						>
							{count > increment * 2 && range[0] > 0 && (
								<Button
									ref={setDecrement}
									style={{ minHeight: "2rem" }}
									onClick={() => load(decrementRange)}
									careful
								>
									{loading ? "Loading..." : "Load More (Previous)"}
								</Button>
							)}

							{paramsElementList}

							{count > increment * 2 && range[1] <= count && (
								<Button
									ref={setIncrement}
									style={{ minHeight: "2rem" }}
									onClick={() => load(incrementRange)}
									careful
								>
									{loading ? "Loading..." : "Load More (Next)"}
								</Button>
							)}
						</div>
					</div>
				</Column>
			</div>
		</ParametersContext.Provider>
	)
}

export default Params
