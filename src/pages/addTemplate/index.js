/* eslint-disable */
import React, { useRef, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiBox, FiFile, FiX, FiLoader } from "react-icons/fi";

import { MainContext } from "../../contexts/MainContext";
import { db, __storage } from "../../firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function AddTemplate() {
	const { mainDataOnly: contextData, tabsData } = useContext(MainContext);

	const navigate = useNavigate();

	const [tabs, setTabs] = tabsData;

	const [tabValue, setTabValue] = useState(contextData.addTemplateTo);

	const [selectTabClicked, setSelectTabClicked] = useState(false);

	const [submitting, setSubmitting] = useState(false);

	const [tags, setTags] = useState([]);

	const [dragOverDiv, setDragOverDiv] = useState(false);

	// const [imgFile, setImgFile] = useState(null);
	const [tempImgFile, setTempImgFile] = useState(null);

	const [imgErr, setImgErr] = useState({
		error: false,
		text: "",
	});

	const date = new Date();
	const imgId = date.getTime();
	const __loc = `images/${imgId}`;

	const tabCollectionRef = collection(db, "tabs");
	const imageStorageRef = ref(__storage, __loc);
	const templatesCollectionRef = collection(db, "templates");

	const tagsInputFieldRef = useRef(null);
	const imageInputRef = useRef(null);

	// const MIN_IMGSIZE = 800; // 800 x 800,
	const MAX_IMGSIZE_IN_BYTES = 50000000; // 5 MB,
	const ALLOWED_EXTENSIONS = [
		"image/jpg",
		"image/gif",
		"image/png",
		"image/jpeg",
	];

	// handle tabValue,
	const __setTabValueOnClick = (id) => {
		setTabValue(tabs[id] ? tabs[id].title : "Tab Not Found");
	};

	// uploading all the data in firebase,
	const __uploadImageToFirebase = async () => {
		// upload control,
		let __tabTitle = "";
		let space_found = false;

		for (let i = 0; i < tabValue.length; i++) {
			if (i == 0) {
				__tabTitle = tabValue[i].toUpperCase();

				continue;
			} else if (tabValue[i] == " ") {
				space_found = true;

				continue;
			} else if (space_found) {
				__tabTitle += " " + tabValue[i].toUpperCase();

				space_found = false;
			} else {
				__tabTitle += tabValue[i];
			}
		}

		let __tabkey = __tabTitle.replace(/\s/g, "-").toLowerCase();

		// uploading image to the firebase storage,
		await uploadString(imageStorageRef, tempImgFile, "data_url")
			.then(async (res) => {
				// getting back the url of the image from the firebase storage,
				await getDownloadURL(res.ref)
					.then(async (url) => {
						// adding data or tabs to the firestore,
						const __oldTabValue = localStorage.tabValueForTemplate
							? JSON.parse(localStorage.tabValueForTemplate)
							: null;

						if (__oldTabValue) {
							await addDoc(tabCollectionRef, {
								key: __tabkey,
								title: __tabTitle,
								orderId: 0,
							})
								.then(async () => {
									// adding data or template of the correspond tab to the firestore,
									await addDoc(templatesCollectionRef, {
										key: __tabkey,
										title: __tabTitle,
										imgId: imgId,
										tags: tags,
										image: url,
										popular: false,
										createdAt: serverTimestamp(),
									})
										.then(() => {
											// finally clearing the localStorage and redirecting back to the homePage,
											localStorage.clear();

											// let's add that tab to the tabLists,
											const newTab = {
												key: __tabkey,
												title: __tabTitle,
												id: "",
											};

											let tabNotFoundInTabs = false;
											tabs.map((tab) => {
												if (tab.title === __tabTitle) {
													tabNotFoundInTabs = false;

													return;
												} else {
													tabNotFoundInTabs = false;
												}
											});

											if (tabNotFoundInTabs) {
												tabs.push(newTab);

												setTabs([...tabs]);
											}

											navigate("/tab:" + __tabkey);
										})
										.catch((error) => {
											console.log(error);
										});
								})
								.catch((error) => console.log(error));
						} else {
							// adding data or template of the correspond tab to the firestore,
							await addDoc(templatesCollectionRef, {
								key: __tabkey,
								title: __tabTitle,
								imgId: imgId,
								tags: tags,
								image: url,
								popular: false,
								createdAt: serverTimestamp(),
							})
								.then(() => {
									// finally clearing the localStorage and redirecting back to the homePage,
									localStorage.clear();

									navigate("/tab:" + __tabkey);
								})
								.catch((error) => {
									console.log(error);
								});
						}
					})
					.catch((error) => console.log(error));
			})
			.catch((error) => console.log(error));
	};

	// submit all data,
	const handleTagsOnSubmit = (event) => {
		event.preventDefault();

		let __tagValue = tagsInputFieldRef.current.value;
		__tagValue = __tagValue.trim();
		__tagValue = __tagValue.replace(" ", "-");

		let tagFound = false;

		tags.forEach((tag) => {
			if (tag === __tagValue) {
				tagFound = true;
				return;
			}
		});

		if (!tagFound) {
			if (tags.length <= 6) {
				tags.push(__tagValue);

				setTags([...tags]);
			}
		}

		// lets empty the input field after submit finished,
		tagsInputFieldRef.current.value = "";
	};

	// ----------------------------------
	// handle file input change,
	// ----------------------------------
	const __changeImageData = (evt, dropped) => {
		evt.preventDefault();
		let file = evt.target.files[0];

		if (dropped) {
			file = evt.dataTransfer.files[0];
		}

		let __errTxt = "";
		let __err = false;

		let __validImage = false;

		if (file && evt.target.files.length >= 1) {
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
					setTempImgFile(reader.result);
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

	// ----------------------------------
	// restore localStorage data to state,
	// ----------------------------------
	useEffect(() => {
		const setTabValueFromLocalStorage = () => {
			let __tabValueForTemplate = localStorage.tabValueForTemplate
				? JSON.parse(localStorage.tabValueForTemplate)
				: null;

			if (__tabValueForTemplate) {
				console.log(__tabValueForTemplate);

				setTabValue(__tabValueForTemplate);
			} else {
				let __tabValue = localStorage.tabValueFromTemplate
					? JSON.parse(localStorage.tabValueFromTemplate)
					: null;

				setTabValue(__tabValue);
			}
		};

		const setTagsFromLocalStorage = () => {
			const __tags = localStorage.tags ? JSON.parse(localStorage.tags) : [];

			setTags(__tags);
		};

		const setTempImgFileFromLocalStorage = () => {
			const __tempImgFile = localStorage.tempImgFile
				? JSON.parse(localStorage.tempImgFile)
				: null;

			setTempImgFile(__tempImgFile);
		};

		setTabValueFromLocalStorage();
		setTagsFromLocalStorage();
		setTempImgFileFromLocalStorage();
	}, []);

	// storing tabValue,
	useEffect(() => {
		localStorage.tabValueFromTemplate = JSON.stringify(tabValue);
	}, [tabValue]);

	// storing tags,
	useEffect(() => {
		if (tags.length <= 0) return;

		localStorage.tags = JSON.stringify(tags);
	}, [tags]);

	// storing image base64 data,
	useEffect(() => {
		if (tempImgFile == null) return;

		localStorage.tempImgFile = JSON.stringify(tempImgFile);
	}, [tempImgFile]);

	// when error in image file,
	useEffect(() => {
		if (imgErr.error == false) return;

		alert(imgErr.text);
	}, [imgErr]);

	return (
		<>
			<div className="relative w-full h-full bg-transparent overflow-hidden">
				{/* Tab name input field */}
				<div className="relative w-full h-24 flex items-center justify-between px-10">
					{/* tab name input field */}
					<div className="relative w-auto h-auto grid gap-3 justify-items-start">
						<div className="relative font-semibold text-sm text-gray-800">
							{"Tab Name"}
						</div>

						{/* tab field */}
						<div className="relative w-40 h-auto z-60">
							<button
								type="button"
								className={
									"relative w-auto h-11 px-5 border-white focus:border-2 focus:ring-2 " +
									(tabValue == null || tabValue.length <= 0
										? "focus:ring-gray-200 bg-gray-100 text-gray-800"
										: " ring-blue-600 bg-blue-500 text-white") +
									" duration-100 rounded-xl cursor-pointer overflow-hidden flex items-center"
								}
								onClick={() => {
									const __oldTabValue =
										localStorage.tabValueForTemplate
											? JSON.parse(localStorage.tabValueForTemplate)
											: null;

									if (__oldTabValue) {
										alert(
											"This is newly added tab, \n You can't choose other."
										);
									} else {
										setSelectTabClicked(true);
									}
								}}
								onBlur={() =>
									setTimeout(() => {
										setSelectTabClicked(false);
									}, 300)
								}
							>
								<div className="relative font-semibold text-sm">
									{tabValue ? tabValue : "Select Tab"}
								</div>
							</button>

							{/* absolute dropdown */}
							{selectTabClicked ? (
								<>
									<div className="absolute z-60 left-0 top-[55px] duration-200 border w-full h-auto rounded-xl bg-white shadow-sm">
										<div className="absolute z-10 left-7 -top-2 rounded-md rotate-45 w-6 h-6 border bg-white"></div>

										<div className="relative z-20 w-full h-auto grid gap-1 p-1 rounded-xl bg-white">
											{tabs.map((tab, index) => (
												<div
													key={index}
													className={
														"relative w-full h-10 rounded-lg px-4 cursor-pointer duration-200 " +
														(tabValue === tab.title
															? "bg-gray-100"
															: "hover:bg-gray-100") +
														" flex items-center"
													}
													onClick={() => {
														__setTabValueOnClick(index);
													}}
												>
													<div className="relative font-semibold text-xs text-gray-700">
														{tab.title}
													</div>
												</div>
											))}
										</div>
									</div>
								</>
							) : null}
						</div>
					</div>

					{/* submit tab with template image */}
					<div className="relative">
						<form
							onSubmit={(event) => {
								event.preventDefault();

								// checking all the requirements,
								if (tabValue == null || tabValue.length <= 0) {
									alert("You haven't selected any tabs");
								} else if (tags.length <= 0) {
									tagsInputFieldRef.current.focus();
								} else {
									setSubmitting(true);

									__uploadImageToFirebase();
								}
							}}
							method="POST"
							className="relative h-auto grid gap-3"
						>
							<div className="relative"></div>

							<button
								type="submit"
								className="relative border-0 border-white outline-none duration-100 focus:border-2 focus:ring-2 ring-blue-600 w-auto px-10 h-11 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center"
							>
								{submitting ? (
									<>
										<div className="relative w-full h-full flex items-center justify-center">
											<div className="relative text-white flex items-center justify-center duration-1000 ease-linear animate-spin">
												<FiLoader size={24} />
											</div>
										</div>
									</>
								) : (
									<>
										<div className="relative font-semibold text-base text-white text-center capitalize">
											{"Post Done"}
										</div>
									</>
								)}
							</button>

							<div className="relative"></div>
						</form>
					</div>
				</div>

				{/* Templates for the Tab */}
				<div className="relative w-full h-[calc(100%-6rem)] overflow-hidden bg-transparent">
					{/* Extra layer for more accurate data */}
					{tabValue == null || tabValue.length <= 2 ? (
						<>
							<div className="absolute w-full h-full left-0 top-0 z-50 bg-gray-200/50"></div>
						</>
					) : null}

					<div className="relative z-10 w-full h-full 2xl:flex xl:flex lg:flex border-t">
						<div className="relative 2xl:w-8/12 xl:w-8/12 lg:w-8/12 w-full 2xl:h-full xl:h-full lg:h-full h-[70%] 2xl:border-r xl:border-r lg:border-r border-b">
							<div
								className={
									"relative w-full h-full flex items-center justify-center " +
									(dragOverDiv ? "bg-gray-100/40" : "")
								}
								onDragOver={(event) => {
									event.preventDefault();

									setDragOverDiv(true);
								}}
								onDragLeave={(event) => {
									event.preventDefault();

									setDragOverDiv(false);
								}}
								onDragEnd={(event) => {
									event.preventDefault();

									setDragOverDiv(false);
								}}
								onDrop={(event) => {
									__changeImageData(event, true);
								}}
							>
								{/* choosed image */}
								{tempImgFile ? (
									<>
										<img
											src={tempImgFile}
											alt="template-image"
											className="absolute left-0 top-0 z-50 w-full h-full flex items-center justify-center"
											onClick={() => {
												imageInputRef.current.click();
											}}
										/>
									</>
								) : null}

								<div className="relative w-auto h-auto grid gap-6 border-2 border-dashed border-blue-500 hover:border-blue-700 duration-300 px-10 py-4 overflow-hidden rounded-2xl cursor-pointer">
									<label
										htmlFor="templateImage"
										className="absolute w-full h-full left-0 top-0 z-30 bg-transparent cursor-pointer"
									></label>

									<div className="relative flex items-center justify-center">
										<FiFile size={60} color={"#000000"} />
									</div>

									<div className="relative font-semibold text-sm text-gray-800 text-center">
										{"Click to Add Image"}
									</div>

									<form
										encType="multipart/form-data"
										onSubmit={(event) => {
											event.preventDefault();
										}}
									>
										<input
											type="file"
											accept="image/x-png, image/jpg, image/jpeg"
											className="relative hidden"
											ref={imageInputRef}
											id="templateImage"
											onChange={(event) => {
												__changeImageData(event, false);
											}}
											datatype="images/"
										/>
									</form>
								</div>
							</div>
						</div>

						<div className="relative 2xl:w-4/12 xl:w-4/12 lg:w-4/12 w-full 2xl:h-full xl:h-full lg:h-full h-[30%]">
							<div className="relative w-full h-14 flex items-center justify-between px-5">
								<div className="relative font-semibold text-base text-gray-800 text-left">
									{"Tags for Image"}
								</div>
							</div>

							<div className="relative w-full h-[calc(100%-3.5rem)] overflow-auto">
								{tags.length <= 0 ? (
									<>
										<div className="relative w-full h-auto px-5 py-2 text-left font-medium text-sm text-gray-600">
											{"No tags"}
										</div>
									</>
								) : (
									<>
										<div className="relative w-full h-auto px-5 py-2 flex flex-wrap items-center gap-3">
											{tags.map((tag, index) => (
												<div
													key={index}
													className="relative w-auto h-auto px-4 py-2 rounded-lg bg-gray-100 group font-semibold text-gray-800 text-center"
												>
													{tag}

													{/* delete button */}
													<div
														className="absolute z-30 duration-100 -right-1 -top-1 opacity-0 cursor-pointer group-hover:opacity-100 rounded-full w-5 h-5 bg-white flex items-center justify-center"
														onClick={() => {
															tags.splice(index, 1);

															setTags([...tags]);
														}}
													>
														<div className="relative w-4 h-4 flex items-center justify-center rounded-full bg-gray-800 text-gray-50">
															<FiX size={12} />
														</div>
													</div>
												</div>
											))}
										</div>
									</>
								)}

								{/* tags input field */}
								<div className="relative w-full h-auto px-5 my-4">
									<div className="relative w-full h-11 flex items-center justify-center">
										<form
											className="relative w-full h-full"
											onSubmit={handleTagsOnSubmit}
										>
											{/* tag icon */}
											<label
												htmlFor="tagsInputField"
												className="absolute w-12 h-full flex items-center justify-center z-10 text-gray-700"
											>
												<FiBox size={24} />
											</label>

											<input
												className="relative w-full h-full rounded-lg duration-300 ring-3 ring-blue-600 ring-opacity-60 focus:ring-opacity-100 bg-transparent font-semibold text-sm text-gray-700 placeholder-gray-500 pl-12 pr-4 outline-none"
												placeholder="Tags for image"
												ref={tagsInputFieldRef}
												autoFocus
												required
												id="tagsInputField"
												minLength={2}
												maxLength={15}
											/>
										</form>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
