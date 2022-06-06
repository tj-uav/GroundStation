import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { Button, CheckboxList } from "components/UIElements"
import { Column, Row } from "components/Containers"
import { httpget } from "backend"
import { dark, darkest, darkdark, red } from "theme/Colors"

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
	const [autoScroll, setAutoScroll] = useState(true)
	const [filters, setFilters] = useState(["[INFO     ]", "[IMPORTANT]", "[WARNING  ]", "[ERROR    ]", "[CRITICAL ]"])
	const autoScrollRef = useRef()
	const scrollDiv = useRef()
	const container = useRef()
	const logsRef = useRef()
	const filtersRef = useRef()
	autoScrollRef.current = autoScroll
	logsRef.current = logs
	filtersRef.current = filters

	const scrollToBottom = () => {
		scrollDiv.current.scrollIntoView()
	}

	const updateData = () => {
		httpget("/logs", (response) => {
			setLogs(response.data.result)
			checkScrolling(true)
		})
	}

	const checkScrolling = (shouldScroll) => {
		let scrollTop = container.current.scrollTop
		let windowHeight = container.current.clientHeight
		let scrollHeight = container.current.scrollHeight
		if (scrollTop < scrollHeight - windowHeight && shouldScroll && autoScrollRef.current) {
			scrollToBottom()
		} else if (Math.ceil(scrollTop) < scrollHeight - windowHeight && !shouldScroll) {
			setAutoScroll(false)
		} else if (Math.ceil(scrollTop) === scrollHeight - windowHeight) {
			setAutoScroll(true)
		}
	}

	useEffect(() => {
		if (window.sessionStorage.getItem("logs")) {
			setLogs(window.sessionStorage.getItem("logs").split("|||"))
		}
		if (window.sessionStorage.getItem("filters")) {
			setFilters(window.sessionStorage.getItem("filters").split("|||"))
		}
		if (window.sessionStorage.getItem("autoScroll")) {
			setAutoScroll(true)
			scrollToBottom()
		}

		const tick = setInterval(() => {
			updateData()
		}, 1000)

		return () => {
			clearInterval(tick)
			window.sessionStorage.setItem("logs", logsRef.length > 0 ? "" : logsRef.current.reduce((p, n) => {
				return p + "|||" + n
			}))
			window.sessionStorage.setItem("filters", filtersRef.length > 0 ? "" : filtersRef.current.reduce((p, n) => {
				return p + "|||" + n
			}))
			if (autoScrollRef.current) {
				window.sessionStorage.setItem("autoScroll", true)
			}
		}
	}, [])

	useEffect(() => { checkScrolling(false) })

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
					<div>
						<ScrollButton onChange={() => { scrollDiv.current.scrollIntoView(); setAutoScroll(true) }}>Scroll To End</ScrollButton>
					</div>
				</Row>
			</CheckboxList>
			<StyledLogsContainer ref={container}>
				{logs?.filter((log) => {
					for (let filter of filters) {
						if (log.includes(filter)) {
							return true
						}
					}
				}).map((log) => {
					return (
						<StyledLog content={log} />
					)
				})}
				<div ref={scrollDiv} />
			</StyledLogsContainer>
		</StyledContainer>
	)
}

const StyledLog = ({ content }) => {
	let type = content.replace(/\].*/, "").slice(1).trim()
	content = content.replace(/\[.*?\]/, "[" + type + "]")

	return (
		<StyledLogContainer color={colors[type]}>
			<StyledLogText color={colors[type]}>{content}</StyledLogText>
		</StyledLogContainer>
	)
}

const ScrollButton = styled(Button)`
	margin: 2em 0 0 auto;
	width: 75%;
	height: 2.5em;
`

const StyledContainer = styled.div`
	height: calc(100vh - 15rem);
`

const StyledLogText = styled.p`
	color: ${props => props.color};
`

const StyledLogContainer = styled.div`
	border-left: 5px solid ${props => props.color};
	padding-left: 7px;
`

const StyledLogsContainer = styled.div`
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
