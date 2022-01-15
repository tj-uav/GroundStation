import React, { useEffect, useState, useRef, createContext } from "react"

import SubmissionEditor from "pages/Submissions/SubmissionEditor"
import TabBar from "components/TabBar"
import { View, Submitted, Rejected } from "pages/Submissions/Tabs"
import { httpget, httppost } from "backend"

export const SubmitContext = createContext()

function onSubmit(data) {
	// TODO: shwoop up to server here
	const { submitted: _, ...rest } = data
	console.log("Submitted!", rest)
}

const Submissions = () => {
	const [data, setData] = useState([])
	const [images, setImages] = useState([])
	const [active, setActive] = useState(0)
	const dataRef = useRef()
	const imagesRef = useRef()
	const activeRef = useRef()
	dataRef.current = data
	activeRef.current = active
	imagesRef.current = images

	const newActive = (d) => {
		for (let i = 0; i < d.length; i++) {
			if (d[i].status === null) {
				return i
			}
		}
		return undefined
	}

	const queryData = () => {
		httpget("/interop/odlc/list", async (response) => {
			const odlcsEqual = (a, b) => {
				if (a.alphanumeric === b.alphnumeric ||
					a.alphanumeric_color === b.alphanumeric_color ||
					a.auto_submit === b.auto_submit ||
					a.created === b.created ||
					a.description === b.description ||
					a.latitude === b.latitude ||
					a.longitude === b.longitude ||
					a.orientation === b.orientation ||
					a.shape === b.shape ||
					a.shape_color === b.shape_color ||
					a.status === b.status ||
					a.type === b.type) {
						return true
					}
				return false
			}

			let resData = response.data.result.map((odlc) => {
				return { ...odlc, orientation: (odlc.orientation-1)*45 }
			})

			let changed = false
			if (resData.length !== dataRef.current.length) {
				changed = true
			} else {
				for (let i = 0; i < dataRef.current.length; i++) {
					if (!odlcsEqual(dataRef.current[i], resData[i])) {
						changed = true
					}
				}
			}

			if (changed) {
				setData(resData)

				let imagesData = []
				for (let i = 0; i < resData.length; i++) {
					await httpget("/interop/odlc/image/"+i, (res) => {
						imagesData.push(res.data.image)
					})
				}

				setImages(imagesData)
			}
		}, async (exception) => {
			console.log(exception)
		})
	}

	useEffect(() => {
		queryData()
		const tick = setInterval(() => {
			queryData()
		}, 1000)
		return () => clearInterval(tick)
	}, [])

	const convertOdlc = (o) => {
		return { ...o, orientation: o.orientation/45+1 }
	}

	const accept = async (i, formData) => {
		let d = data
		if (formData) {
			d[i] = formData
			let submit = convertOdlc(d[i])
			await httppost("/interop/odlc/edit/"+i, submit)
		}
		d[i].status = "submitted"
		setData(d)
		await httppost("/interop/odlc/submit/"+i, { status: "submitted" })
		await httppost("/interop/odlc/image/"+i, images[i])
		setActive(newActive(data))
	}

	const edit = async (i, formData) => {
		let d = data
		let odlc = d[i]
		d[i] = formData
		odlc = convertOdlc(d[i])
		setData(d)
		console.log(formData)
		await httppost("/interop/odlc/edit/"+i, { ...odlc, image: images[i] })
	}

	const reject = async (i, formData) => {
		let d = data
		if (formData) {
			d[i] = formData
			let reject = convertOdlc(d[i])
			await httppost("/interop/odlc/edit/"+i, reject)
		}
		d[i].status = false
		setData(d)
		await httppost("/interop/odlc/reject/"+i, { status: "rejected" })
		setActive(newActive(data))
	}

	return (
		<SubmitContext.Provider value={onSubmit}>
			<div
				style={{
					display: "grid",
					padding: "1rem 1rem 0 1rem",
					gridTemplateColumns: "37rem 100fr",
					gap: "1rem",
					width: "100%",
					height: "auto",
					overflowY: "hidden",
				}}
			>
				<TabBar>
					<View
						active={[active, setActive]}
						data={[data, setData]}
						onSubmit={onSubmit}
						images={[images, setImages]}
						accept={accept}
						edit={edit}
						reject={reject}
					/>
					<Submitted
						active={[active, setActive]}
						data={[data, setData]}
						onSubmit={onSubmit}
						images={[images, setImages]}
					/>
					<Rejected
						active={[active, setActive]}
						data={[data, setData]}
						onSubmit={onSubmit}
						images={[images, setImages]}
						accept={accept}
						edit={edit}
						reject={reject}
					/>
				</TabBar>
				<SubmissionEditor data={[data, setData]} active={[active, setActive]} images={[images, setImages]} accept={accept} edit={edit} reject={reject} />
			</div>
		</SubmitContext.Provider>
	)
}

export default Submissions
