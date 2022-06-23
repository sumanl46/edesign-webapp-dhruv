/* eslint-disable */
import React, { useEffect, useState } from "react";

import { db, __storage } from "../../firebase-config";
import {
	ref,
	uploadString,
	deleteObject,
	getDownloadURL,
} from "firebase/storage";
import { updateDoc, setDoc, doc, getDoc } from "firebase/firestore";

export default function SearchBg() {
	const [imageFile, setImageFile] = useState(null);
	const [updating, setUpdating] = useState(false);

	const searchBgRef = doc(db, "search-bg", "bg");

	const loadSearchBg = async () => {
		const response = await getDoc(searchBgRef);

		if (response.exists) {
			setImageFile(response.data());
		} else {
			return;
		}
	};

	const __update = async (imageData, first) => {
		const date = new Date();
		const pathname = "images/" + date.getTime();
		const storageRef = await ref(__storage, pathname);

		await uploadString(storageRef, imageData, "data_url").then(
			async (res) => {
				await getDownloadURL(res.ref).then(async (url) => {
					if (first) {
						await setDoc(searchBgRef, {
							loc: pathname,
							uri: url,
						})
							.then(() => {
								setUpdating(false);

								alert("Updated");

								loadSearchBg();

								console.log("Done");
							})
							.catch((error) => {
								setUpdating(false);
								alert("Failed to udpate");

								console.log(error);
							});
					} else {
						await updateDoc(searchBgRef, {
							loc: pathname,
							uri: url,
						})
							.then(() => {
								setUpdating(false);

								alert("Updated");

								loadSearchBg();

								console.log("Done");
							})
							.catch((error) => {
								setUpdating(false);
								alert("Failed to udpate");

								console.log(error);
							});
					}
				});
			}
		);
	};

	const updateSearchBg = async (imageData) => {
		if (imageFile) {
			const deleteStorageRef = await ref(__storage, imageFile.loc);

			await deleteObject(deleteStorageRef)
				.then(() => {
					__update(imageData, false);
				})
				.catch((err) => console.log(err));
		} else {
			__update(imageData, true);
		}
	};

	const checkImage = (e) => {
		const file = e.target.files[0];

		if (file && e.target.files.length >= 1) {
			if (file.size > 50000000) {
				alert("File size is too large,\nTry less than 5MB.");
			} else {
				const fileReader = new FileReader();
				fileReader.readAsDataURL(file);

				fileReader.onload = () => {
					setUpdating(true);
					updateSearchBg(fileReader.result);
				};
			}
		} else {
			return;
		}
	};

	useEffect(() => {
		loadSearchBg();

		return () => {};
	}, []);

	return (
		<>
			<div className="relative w-full h-full overflow-hidden">
				<div className="relative w-full h-14 bg-gray-50 px-6 text-left inline-flex gap-2 items-center font-semibold text-base text-gray-800 border-b">
					<span>{"Manage the background image for"}</span>
					<div className="relative px-2 py-1 rounded-md bg-gray-100 cursor-default border font-semibold text-sm">
						{"Search Box"}
					</div>
				</div>

				{/* search bgs */}
				<div className="relative w-full h-[calc(100%-3.5rem)] overflow-auto">
					<form
						action="#"
						onSubmit={(e) => e.preventDefault()}
						className="relative w-full h-full group"
					>
						{/* image */}
						<img
							src={imageFile ? imageFile.uri : ""}
							alt="search-bg image"
							className="relative w-full h-full flex items-center justify-center"
						/>

						{/* hidden file input */}
						<input
							type={"file"}
							accept="image/x-png, image/jpeg, image/jpg"
							className="hidden"
							id="fileInput"
							onChange={checkImage}
						/>

						{/* Hidden submit button */}
						<button type="submit" className="hidden"></button>

						{/* absolute box */}
						<div className="absolute w-full h-full left-0 top-0 z-20 bg-gray-800/40 opacity-0 duration-300 group-hover:opacity-100 flex items-center justify-center">
							<div className="relative w-auto h-auto p-6 rounded-xl bg-white duration-200 transition-all top-4 group-hover:top-0">
								<button
									type="button"
									className="relative px-12 py-2 bg-white text-gray-800 text-sm rounded-lg duration-200 outline-none border-[1px] focus:border-white focus:border-2 ring-2 capitalize ring-transparent focus:ring-blue-600 text-center"
								>
									<label
										htmlFor="fileInput"
										className="relative w-full h-full cursor-pointer"
									>
										{"Update Image"}
									</label>
								</button>
							</div>
						</div>
					</form>
				</div>

				{/* while updating */}
				{updating ? (
					<>
						<div className="fixed left-0 top-0 z-60 w-full h-full flex items-center justify-center bg-gray-800/50">
							<div className="relative font-medium text-white text-sm text-center">
								{"Updating"}
							</div>
						</div>
					</>
				) : null}
			</div>
		</>
	);
}
