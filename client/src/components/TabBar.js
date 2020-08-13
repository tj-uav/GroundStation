import React, { useState, useEffect } from "react"
import { Switch, Route, Redirect, useRouteMatch, useLocation } from "react-router-dom"

import { Button } from "./UIElements"
import { Row } from "./Containers"

const TabButton = ({ current, children }) => {
	const name = children.toLowerCase()
	const isActive = name === current.replace("/", "")
	return (
		<Button to={name} active={isActive} controlled>
			{children}
		</Button>
	)
}

const TabBar = ({ children, ...props }) => {
	const match = useRouteMatch()
	const location = useLocation()
	const [currentTab, setTab] = useState("/")

	useEffect(() => {
		setTab(location.pathname.replace(match.path, ""))
	}, [location, match, currentTab])

	const paths = children.map(tab => ({
		path: `${match.path}/${tab.type.name.toLowerCase()}`,
		component: tab,
	}))

	return (
		<section>
			<Row id="tabs" gap="1rem" height="3rem" style={{ marginBottom: "1rem" }} {...props}>
				{children.map(component => (
					<TabButton key={component.type.name} current={currentTab}>
						{component.type.name}
					</TabButton>
				))}
			</Row>
			<Switch>
				{paths.map(obj => (
					<Route key={obj.path} path={obj.path} exact>
						{obj.component}
					</Route>
				))}
				<Route path={`${match.path}/`}>
					<Redirect to={paths[0].path} />
				</Route>
			</Switch>
		</section>
	)
}

export default TabBar
