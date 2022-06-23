/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import AdsGrid from "./ads";

import { db, __storage } from "../../firebase-config";
import {
	collection,
	addDoc,
	getDocs,
	serverTimestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { FiCheck } from "react-icons/fi";

function AddAdContainer({ cancelAndHideContainer, detectChanged }) {
	const [ads, setAds] = useState([]);

	const [title, setTitle] = useState("");
	const [link, setLink] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [thumbnail, setThumbnail] = useState("");

	const [allSet, setAllSet] = useState(false);

	const [imgErr, setImgErr] = useState({
		error: false,
		text: "",
	});

	const fileInputRef = useRef(null);

	const MAX_IMGSIZE_IN_BYTES = 20000000; // 5 MB,
	const ALLOWED_EXTENSIONS = [
		"image/jpg",
		"image/gif",
		"image/png",
		"image/jpeg",
	];

	const adsCollectionRef = collection(db, "ads");

	const date = new Date();
	const imgId = date.getTime();
	const __loc = `images/${imgId}`;

	const imageStorageRef = ref(__storage, __loc);

	// handle file input on change,
	const handleFileInput = (event) => {
		event.preventDefault();

		const file = event.target.files[0];

		let __errTxt = "";
		let __err = false;

		let __validImage = false;
		if (file) {
			ALLOWED_EXTENSIONS.forEach((ext, id) => {
				if (ext === file.type) {
					__validImage = true;
					return;
				}
			});

			// check the size of the image and type of the image,
			if (__validImage == false) {
				__err = true;
				__errTxt = "Extension is not valid";
			} else if (file.size > MAX_IMGSIZE_IN_BYTES) {
				__err = true;
				__errTxt = "Image size is too large";
			} else {
				const reader = new FileReader();

				reader.readAsDataURL(file);

				reader.onloadend = (e) => {
					setImageFile(reader.result);
				};
			}
		} else {
			__err = true;
			__errTxt = "Image is not selected";
		}

		setImgErr({
			...imgErr,
			error: __err,
			text: __errTxt,
		});
	};

	const submitData = async () => {
		if (allSet) {
			// storing image to firebase storage,
			await uploadString(imageStorageRef, imageFile, "data_url")
				.then(async (res) => {
					await getDownloadURL(res.ref)
						.then(async (url) => {
							setThumbnail(url);

							await addDoc(adsCollectionRef, {
								title: title,
								link: link,
								thumbnail: url,
								loc: __loc,
								pinned: ads.length <= 0 && true,
								createdAt: serverTimestamp(),
							})
								.then(() => {
									cancelAndHideContainer();
									alert("Done");

									detectChanged();
								})
								.catch((error) => {
									alert("Failed");
									console.log(error);
								});
						})
						.catch((error) => console.log(error));
				})
				.catch((error) => console.log(error));
		} else {
			return;
		}
	};

	const getAds = async () => {
		const response = await getDocs(adsCollectionRef);

		setAds(response.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
	};

	useEffect(() => {
		getAds();

		if (title.length >= 2 && link.length >= 15 && imageFile) {
			setAllSet(true);
		} else {
			setAllSet(false);
		}

		return () => {};
	}, [title, link, imageFile]);

	return (
		<>
			<div className="fixed w-screen h-screen divide-purple-300 transition-all left-0 top-0 z-60 bg-gray-800/60 flex items-center justify-center">
				<form
					onSubmit={(event) => event.preventDefault()}
					className="relative bg-white rounded-3xl h-auto w-auto overflow-auto min-w-[40%] max-w-[80%] max-h-[80%] p-2"
				>
					<div className="relative w-full h-full">
						{/* heading section */}
						<div className="relative w-full h-12 px-6 min-h-[3rem] flex items-center justify-between">
							<div className="relative font-semibold text-base text-gray-700">
								{"Fill Up the following requirements"}
								<span className="text-red-500">{"*"}</span>
							</div>
						</div>

						{/* content section */}
						<div className="relative w-full h-[calc(100%-6rem)]">
							<div className="relative w-full h-auto grid gap-4 px-6">
								{/* title */}
								<div className="relative w-full h-12 rounded-xl border flex divide-x overflow-hidden">
									<div className="relative h-full w-28 flex items-center px-3 justify-end bg-gray-50 overflow-auto">
										<div className="relative font-semibold text-sm text-gray-700">
											{"Title"}
										</div>
									</div>

									<div className="relative w-[calc(100%-7rem)] h-full">
										<input
											type={"text"}
											className="relative w-full h-full outline-none border-none px-3 text-left text-sm placeholder-gray-500"
											placeholder="Enter your title here..."
											required
											autoFocus
											minLength={2}
											maxLength={25}
											onKeyUp={(event) => {
												const val = event.target.value;

												setTitle(val);
											}}
										/>
									</div>
								</div>

								{/* page link or url link */}
								<div className="relative w-full h-12 rounded-xl border flex divide-x overflow-hidden">
									<div className="relative h-full w-28 flex items-center px-3 justify-end bg-gray-50 overflow-auto">
										<div className="relative font-semibold text-sm text-gray-700">
											{"Link"}
										</div>
									</div>

									<div className="relative w-[calc(100%-7rem)] h-full">
										<input
											type={"text"}
											required
											minLength={15}
											className="relative w-full h-full outline-none border-none px-3 text-left text-sm placeholder-gray-500"
											placeholder="https://example.com [web-link or app-link]"
											onKeyUp={(event) => {
												const val = event.target.value;

												setLink(val);
											}}
										/>
									</div>
								</div>

								{/* image link */}
								<div className="relative w-full h-12 rounded-xl border flex divide-x overflow-hidden">
									<div className="relative h-full w-28 flex items-center px-3 justify-end bg-gray-50 overflow-auto">
										<div className="relative font-semibold text-sm text-gray-700">
											{"Image"}
										</div>
									</div>

									<div className="relative w-[calc(100%-7rem)] h-full flex items-center">
										<input
											type={"file"}
											accept="image/x-png, image/jpg, image/jpeg"
											className="relative outline-none border-none px-3 text-left text-sm placeholder-gray-500"
											ref={fileInputRef}
											required
											onChange={handleFileInput}
										/>
									</div>
								</div>

								{/* image error */}
								<div className="relative w-full h-auto py-2 text-center flex items-center justify-center text-sm text-red-400">
									{imgErr.error ? (
										imgErr.text
									) : allSet ? (
										<FiCheck size={20} color="#3498DB" />
									) : thumbnail != "" ? (
										thumbnail
									) : (
										"..."
									)}
								</div>
							</div>
						</div>

						{/* bottom buttons */}
						<div className="relative w-full h-12 px-6 min-h-[3rem] flex items-center justify-end">
							<div className="relative flex items-center justify-center gap-5">
								{/* cancel button */}
								<button
									type="button"
									className="relative w-auto h-10 px-6 border-white focus:border-2 focus:ring-2 ring-gray-200 bg-gray-100 hover:bg-gray-200 text-gray-700 duration-300 rounded-lg cursor-pointer overflow-hidden flex items-center font-medium"
									onClick={cancelAndHideContainer}
								>
									{"Cancel"}
								</button>

								{/* submit button */}
								<button
									type="submit"
									className="relative w-auto h-10 px-6 border-white focus:border-2 focus:ring-2 ring-blue-600 bg-blue-500 hover:bg-blue-600 text-white duration-300 rounded-lg cursor-pointer overflow-hidden flex items-center font-medium"
									onClick={submitData}
								>
									{"Done"}
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</>
	);
}

export default function AdsManager() {
	const [showContainer, setShowContainer] = useState(false);
	const [changed, setChanged] = useState(false);

	return (
		<>
			<div className="relative w-full h-full overflow-auto">
				{/* add ad container :absolute */}
				{showContainer ? (
					<AddAdContainer
						cancelAndHideContainer={() => setShowContainer(false)}
						detectChanged={() => setChanged(!changed)}
					/>
				) : null}

				{/* top section */}
				<div className="relative w-full h-16 min-h-[4rem] px-10 flex items-center justify-between border-b">
					<div className="relative flex items-center font-semibold text-sm text-gray-800">
						{"All Your Ads"}
					</div>

					{/* add ad btn */}
					<div className="relative">
						<button
							type="button"
							className="relative w-auto h-10 px-6 border-white focus:border-2 focus:ring-2 ring-blue-600 bg-blue-500 text-white duration-100 rounded-xl cursor-pointer overflow-hidden flex items-center font-medium"
							onClick={() => setShowContainer(true)}
						>
							{"Add Ad"}
						</button>
					</div>
				</div>

				{/* ads grid */}
				<div className="relative w-full h-full overflow-auto">
					{changed ? <AdsGrid /> : <AdsGrid />}
				</div>
			</div>
		</>
	);
}
