/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";

import { db } from "../../../firebase-config";
import { updateDoc, doc } from "firebase/firestore";

export default function Tab({ tab, onChanged }) {
	let location = useLocation();

	let matched = false;

	let __tab = "tab:" + tab.key;
	let pathname = location.pathname.replace("/", "");

	const [num, setNum] = useState(tab.orderId);
	const [mouseOver, setMouseOver] = useState(false);

	const orderIdInputRef = useRef(null);

	const tabRef = doc(db, "tabs", tab.id);

	if (pathname === __tab) {
		matched = true;
	}

	const updateTab = async (id) => {
		await updateDoc(tabRef, {
			orderId: eval(`${id}`),
		})
			.then(() => {
				setMouseOver(false);
				onChanged();
			})
			.catch((error) => console.log(error));
	};

	const [opacity, setOpacity] = useState(0);
	const [top, setTop] = useState(10);

	useEffect(() => {
		setTimeout(() => {
			setOpacity(1);
			setTop(0);
		}, 100);
	}, [tab]);

	return (
		<>
			<div
				className={
					"relative w-full h-11 rounded-xl " +
					(matched
						? "bg-blue-500 hover:bg-blue-600 text-white"
						: "bg-transparent text-gray-700 hover:bg-gray-100") +
					" px-4 overflow-hidden duration-200"
				}
				style={{
					opacity: opacity,
					top: top,
				}}
				onMouseEnter={() => {
					setMouseOver(true);
					setNum(tab.orderId);
				}}
				onMouseLeave={() => {
					if (num !== null && num.length > 0) {
						return;
					} else {
						setMouseOver(false);
					}
				}}
			>
				<Link
					to={__tab}
					className="relative w-full h-full flex items-center"
				>
					<div className="relative font-semibold text-xs tracking-wide">
						{tab.title}
					</div>
				</Link>

				{/* absolute */}
				<div
					className={
						"absolute z-40 right-0 top-0 w-auto h-full overflow-hidden" +
						(mouseOver ? "" : " hidden")
					}
				>
					<form
						onSubmit={(event) => event.preventDefault()}
						className="relative w-auto h-full flex items-center justify-center p-1"
					>
						<input
							type={"number"}
							className="relative w-12 h-full px-3 rounded-lg font-semibold bg-white border-none outline-none text-blue-500 text-xs text-center"
							minLength={0}
							maxLength={3}
							max={100}
							min={-100}
							ref={orderIdInputRef}
							defaultValue={tab.orderId}
							onKeyDown={(event) => {
								let val = event.target.value;

								if (event.keyCode == 13) {
									if (val > 100) {
										val = 100;
									} else if (val.length == 0) {
										val = 0;
									}
									updateTab(val);
								}

								setNum(val);
							}}
						/>
					</form>
				</div>
			</div>
		</>
	);
}
