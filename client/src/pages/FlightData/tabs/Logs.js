import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { Button, CheckboxList } from "components/UIElements"
import { Column, Row } from "components/Containers"
import { httpget } from "backend"
import { dark, darkest, darkdark, red } from "theme/Colors"
import { useInterval } from "../../../util"

import { VariableSizeList } from "react-window"
import { useBackendConnection } from "../../../GlobalSettings"

const colors = {
	DEBUG: darkdark,
	INFO: darkdark,
	IMPORTANT: "#346CBC",
	WARNING: "#F59505",
	ERROR: red,
	CRITICAL: "#B52F9A"
}

const Logs = () => {
	const [logs, setLogs] = useState([])
	const [autoScroll, setAutoScroll] = useState(false)
	const [filters, setFilters] = useState(["[INFO     ]", "[IMPORTANT]", "[WARNING  ]", "[ERROR    ]", "[CRITICAL ]"])
	const autoScrollRef = useRef()
	const container = useRef()
	const logsRef = useRef()
	const filtersRef = useRef()
	autoScrollRef.current = autoScroll
	logsRef.current = logs
	filtersRef.current = filters

	const filtered = logs.filter((log) => {
		for (let filter of filters) {
			if (log.includes(filter)) {
				return true
			}
		}
	})

	const url = useBackendConnection().backendConnection

	const scrollToBottom = () => {
		container.current.scrollToItem(filtered.length - 1)
	}

	useInterval(3000, () => {
		httpget(url, "/logs", (response) => {
			setLogs(response.data.result)
		})
	})

	useEffect(() => {
		if (autoScroll) {
			scrollToBottom()
		}
	})

	useEffect(() => {
		if (window.sessionStorage.getItem("logs")) {
			setLogs(window.sessionStorage.getItem("logs").split("|||"))
		}
		if (window.sessionStorage.getItem("filters")) {
			setFilters(window.sessionStorage.getItem("filters").split("|||"))
		}
		if (window.sessionStorage.getItem("autoScroll") === "true") {
			setAutoScroll(true)
			scrollToBottom()
		}

		return () => {
			window.sessionStorage.setItem("logs", logsRef.length > 0 ? "" : logsRef.current.reduce((p, n) => {
				return p + "|||" + n
			}))
			window.sessionStorage.setItem("filters", filtersRef.length > 0 ? "" : filtersRef.current.reduce((p, n) => {
				return p + "|||" + n
			}))
			window.sessionStorage.setItem("autoScroll", autoScrollRef.current)
		}
	}, [])

	return (
		<StyledContainer>
			<CheckboxList name="logFilter" onChange={(e) => {
					if (e.target.checked) {
						if (!filters.includes(e.target.value)) {
							setFilters([...filters, e.target.value])
						}
					} else {
						let i = filters.findIndex((f) => f === e.target.value)
						if (i !== -1) {
							setFilters([...filters.slice(0, i), ...filters.slice(i+1)])
						}
					}
				}}
			>
				<Row>
					<Column gap="0em">
						<CheckboxList.Option checked={filters.includes("[DEBUG    ]")} value="[DEBUG    ]" color={colors.DEBUG}>Debug</CheckboxList.Option>
						<CheckboxList.Option checked={filters.includes("[INFO     ]")} value="[INFO     ]" color={colors.INFO}>Info</CheckboxList.Option>
						<CheckboxList.Option checked={filters.includes("[IMPORTANT]")} value="[IMPORTANT]" color={colors.IMPORTANT}>Important</CheckboxList.Option>
					</Column>
					<Column gap="0em">
						<CheckboxList.Option checked={filters.includes("[WARNING  ]")} value="[WARNING  ]" color={colors.WARNING}>Warning</CheckboxList.Option>
						<CheckboxList.Option checked={filters.includes("[ERROR    ]")} value="[ERROR    ]" color={colors.ERROR}>Error</CheckboxList.Option>
						<CheckboxList.Option checked={filters.includes("[CRITICAL ]")} value="[CRITICAL ]" color={colors.CRITICAL}>Critical</CheckboxList.Option>
					</Column>
					<Column gap="0em">
						<ScrollButton href={url + "/logs"} newTab={true}>Open Log File</ScrollButton>
						<ScrollButton onChange={() => { setAutoScroll(!autoScroll) }}>{autoScroll ? "Turn Off Autoscroll" : "Turn On Autoscroll"}</ScrollButton>
					</Column>
				</Row>
			</CheckboxList>
			<div style={{ "padding-top": "1em" }}>
				<StyledLogsContainer
					ref={container}
					height={1100}
					itemCount={filtered.length}
					itemSize={(i) => {
						if (filtered.length === 0) {
							return 56
						}
						return (i === 0 ? 32 : 16) + 24 * Math.ceil(getTextWidth(filtered[i].replace(/\[.*?\]/, "[" + filtered[i].replace(/\].*/, "").slice(1).trim() + "]").trim()) / 360)
					}}
					width={592}
				>
					{({ index, style }) => {
						return (
							<StyledLog style={style} content={filtered[index]} index={index} />
						)
					}}
				</StyledLogsContainer>
			</div>
		</StyledContainer>
	)
}

const getTextWidth = (s) => {
	const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"))
	const context = canvas.getContext("2d")
	const metrics = context.measureText(s)
	return metrics.width
}

const StyledLog = ({ content, style, index }) => {
	let type = content.replace(/\].*/, "").slice(1).trim()
	content = content.replace(/\[.*?\]/, "[" + type + "]")

	return (
		<StyledLogContainer index={index} style={{ ...style, height: style.height - (index === 0 ? 32 : 16), width: "99%" }} color={colors[type]}>
			<StyledLogText color={colors[type]}>{content}</StyledLogText>
		</StyledLogContainer>
	)
}

const ScrollButton = styled(Button)`
	margin: 0.25em 0 0 2.5em;
	width: 75%;
	height: 2em;
`

const StyledContainer = styled.div`
	height: calc(100vh - 15rem);
`

const StyledLogText = styled.p`
	color: ${props => props.color};
`

const StyledLogContainer = styled.div`
	border-left: 5px solid ${props => props.color};
	margin-top: ${props => props.index === 0 ? "16px" : "0"};
	margin-left: 8px;
	padding-left: 7px;
	margin-bottom: 16px;
`

const StyledLogsContainer = styled(VariableSizeList)`
	background: ${dark};
	margin-top: 0.5em;
	padding: 1em 1em 1em 0.5em;
	height: 100%;
	width: 100%;
	overflow-y: scroll;

	&::-webkit-scrollbar {
		width: 20px;
	}
	&::-webkit-scrollbar-thumb {
		background: ${darkest};
		border: 6px solid rgba(0, 0, 0, 0);
		border-radius: 1000px;
		background-clip: padding-box;
		width: 8px;
	}
	&::-webkit-scrollbar-thumb:hover {
		background: ${darkdark};
		background-clip: padding-box;
		trasition: 0.5s;
	}
	&::-webkit-scrollbar-track {
		border: 1px red;
	}
`

export default Logs
