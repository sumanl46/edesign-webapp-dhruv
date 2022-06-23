/* eslint-disable */
import React, { useEffect, useState } from "react";

import { db } from "../../../firebase-config";

import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function RemoveBg() {
	const [data, setData] = useState(null);

	const [url, setUrl] = useState("");
	const [id, setId] = useState("");

	const collectionRef = collection(db, "removeBg");

	const updateData = async (evt) => {
		evt.preventDefault();

		const updateCollectionRef = doc(db, "removeBg", id);

		await updateDoc(updateCollectionRef, {
			url: url,
		})
			.then(() => alert("Updated"))
			.catch((error) => alert(error));
	};

	const loadRemoveBgUrl = async () => {
		const response = await getDocs(collectionRef);

		if (response.empty) {
			return;
		} else {
			setData(response.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
		}
	};

	const handleUrlInput = (evt) => {
		const __url = evt.target.value;
		setUrl(__url.trim());
	};

	useEffect(() => {
		loadRemoveBgUrl();
	}, []);

	useEffect(() => {
		if (data && data[0]) {
			const { title: t, url: u, id: i } = data[0];

			setUrl(u);
			setId(i);
		} else {
			return;
		}
	}, [data]);

	return (
		<>
			<div className="relative w-full h-auto grid gap-4 divide-y">
				<div className="relative w-auto text-left font-semibold text-lg text-gray-800">
					{"Remove Background Link and Title"}
				</div>

				{/* grids */}
				<form
					action="#"
					onSubmit={updateData}
					className="relative w-full h-auto grid gap-2 py-3"
				>
					{/* title */}
					<div className="relative w-1/3 h-12">
						<input
							type={"text"}
							defaultValue={"Remove Background"}
							className="relative w-full h-full px-4 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-base text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-200 focus:border-white ring-0 ring-blue-600 focus:ring-2 cursor-default"
							readOnly
						/>
					</div>

					{/* link */}
					<div className="relative w-9/12 h-12">
						<input
							type={"url"}
							placeholder="URL or Link eg:https/example.com"
							required
							minLength={15}
							maxLength={200}
							defaultValue={data && data[0] ? data[0].url : ""}
							onKeyUp={handleUrlInput}
							className="relative w-full min-w-[8rem] h-full px-4 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-sm text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-200 focus:border-white ring-0 ring-blue-600 focus:ring-2"
						/>
					</div>

					<input type={"submit"} className="hidden" />
				</form>
			</div>
		</>
	);
}
