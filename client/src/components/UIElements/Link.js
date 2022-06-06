import React, { forwardRef } from "react"
import { Link as RouterLink } from "react-router-dom"

const Link = forwardRef(({ to, href, children, ...props }, ref) => {
	if (to) {
		return (
			<RouterLink ref={ref} to={to} {...props}>
				{children}
			</RouterLink>
		)
	} else {
		return (
			<a ref={ref} target={props.newTab ? "_blank" : null} href={href} {...props}>
				{children}
			</a>
		)
	}
})

export default Link
