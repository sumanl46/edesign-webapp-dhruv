/* eslint-disable */
import React, { useState, useEffect, useRef, useContext } from "react";

import { useNavigate } from "react-router-dom";

import {
	FiFolder,
	FiPlus,
	FiLoader,
	FiActivity,
	FiPackage,
	FiSearch,
	FiHome,
	FiLogOut,
} from "react-icons/fi";

import { HiSun } from "react-icons/hi";

import Tabs from "./tabs";

import { MainContext } from "../../../contexts/MainContext";

import { db } from "../../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import CustomLink from "./customLink";

export default function SideBarContainer() {
	const { mainData } = useContext(MainContext);
	const [contextData, setContextData] = mainData;

	const navigate = useNavigate();

	const [tabValue, setTabValue] = useState(null);

	const [addTab, setAddTab] = useState(false);

	const [checking, setChecking] = useState(false);

	const tabInputFieldRef = useRef(null);

	const [tabErr, setTabErr] = useState({
		error: false,
		text: "",
	});

	// references,
	const tabCollectionRef = collection(db, "tabs");

	const handleTabInputValue = (event) => {
		setChecking(true);

		event.preventDefault();

		let __tab = tabInputFieldRef.current.value;
		__tab = __tab.trim();
		__tab = __tab.toLowerCase();

		const checkTab = async (callback) => {
			const response = await getDocs(tabCollectionRef);

			callback(response.docs);
		};

		if (window.navigator.onLine) {
			checkTab((tabs) => {
				let __tabExistsAlready = false;
				let __tabErrTxt = "";

				if (tabs.length >= 1) {
					for (let i = 0; i < tabs.length; i++) {
						const { key } = tabs[i].data();
						if (key.replace("-", "") === __tab) {
							__tabExistsAlready = true;
							__tabErrTxt = "*already exists";

							break;
						}
					}
				}

				if (!__tabExistsAlready) {
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

					localStorage.setItem(
						"tabValueForTemplate",
						JSON.stringify(__tabTitle)
					);

					setContextData({
						...contextData,
						addTemplateTo: __tabTitle,
					});

					setAddTab(false);

					navigate("/add-template");
				}

				setTabErr({
					error: __tabExistsAlready,
					text: __tabErrTxt,
				});
				setChecking(false);
			}, []);
		} else {
			setChecking(false);

			setTabErr({
				error: true,
				text: "*no internet",
			});
		}
	};

	const setCookie = (cname, cvalue, exdays) => {
		const d = new Date();
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
		let expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	};

	useEffect(() => {
		const setTabValueFromLocalStorage = () => {
			let __tabValue = localStorage.tabValue
				? JSON.parse(localStorage.tabValue)
				: null;

			setTabValue(__tabValue);
		};

		const setTabExistsFromLocalStorage = () => {
			const __tabExists = localStorage.tabExists
				? JSON.parse(localStorage.tabExists)
				: false;

			setTabErr({
				error: window.navigator.onLine ? __tabExists : false,
				text: __tabExists ? "*already exists" : "",
			});
		};

		const setAddTabFromLocalStorage = () => {
			const __addTab = localStorage.addTab
				? JSON.parse(localStorage.addTab)
				: false;

			setAddTab(__addTab);
		};

		setTabExistsFromLocalStorage();
		setTabValueFromLocalStorage();
		setAddTabFromLocalStorage();
	}, []);

	// storing tabExists,
	useEffect(() => {
		localStorage.tabExists = JSON.stringify(tabErr.error);
	}, [tabErr]);

	// storing tabValue,
	useEffect(() => {
		localStorage.tabValue = JSON.stringify(tabValue);
	}, [tabValue]);

	// saving addTab,
	useEffect(() => {
		localStorage.addTab = JSON.stringify(addTab);
	}, [addTab]);

	return (
		<>
			<div className="relative w-full h-full flex divide-x">
				<div className="relative h-full w-1/2">
					<div className="relative w-full h-14 overflow-hidden flex items-center justify-between gap-6 px-5">
						<div className="relative flex items-center gap-5">
							{/* firebase icon */}
							<div className="relative flex items-center justify-center text-blue-600">
								<svg height="28" viewBox="0 0 32 32" width="28">
									<path
										d="M19.62 11.558l-3.203 2.98-2.972-5.995 1.538-3.448c.4-.7 1.024-.692 1.414 0z"
										fill="#ffa000"
									/>
									<path
										d="M13.445 8.543l2.972 5.995-11.97 11.135z"
										fill="#f57f17"
									/>
									<path
										d="M23.123 7.003c.572-.55 1.164-.362 1.315.417l3.116 18.105-10.328 6.2c-.36.2-1.32.286-1.32.286s-.874-.104-1.207-.3L4.447 25.673z"
										fill="#ffca28"
									/>
									<path
										d="M13.445 8.543l-8.997 17.13L8.455.638c.148-.78.592-.855.988-.167z"
										fill="#ffa000"
									/>
								</svg>
							</div>

							{/* title */}
							<div className="relative font-semibold text-sm text-gray-800 text-left">
								{"E-Design"} <br />
								<span className="relative font-medium text-xs text-opacity-70">
									{"Dashboard"}
								</span>
							</div>
						</div>
					</div>

					{/* grids */}
					<div className="relative w-full h-[calc(100%-3.5rem)] border-t overflow-auto">
						<div className="relative w-full h-full px-4">
							<div className="relative w-full h-auto grid gap-2 py-4">
								{/* HomePage */}
								<CustomLink to="/" title="Home">
									<FiHome size={22} />
								</CustomLink>

								{/* View all templates */}
								<CustomLink to="/templates" title="All Templates">
									<FiPackage size={22} />
								</CustomLink>

								{/* Add or manage search tags */}
								<CustomLink to="/search-tags" title="Search Tags">
									<FiSearch size={22} />
								</CustomLink>

								{/* Add add tab */}
								<CustomLink to="/manage-ads" title="Manage Ads">
									<FiActivity size={22} />
								</CustomLink>

								{/* Add add tab */}
								<CustomLink to="/search-background" title="Search Bg">
									<FiSearch size={22} />
								</CustomLink>

								{/* horizontal line */}
								<hr />

								{/* Add template tab */}
								<CustomLink to="/add-template" title="Add Template">
									<FiPlus size={22} />
								</CustomLink>

								{/* logout button */}
								{contextData.signedIn ? (
									<>
										<button
											type="button"
											className="relative w-full h-11 rounded-xl text-gray-800 bg-gray-100 border border-gray-200 hover:border-gray-300 hover:bg-gray-200 cursor-pointer px-5 flex items-center gap-4 duration-300"
											onClick={() => {
												setCookie("email", "", 0);
												setCookie("password", "", 0);

												window.location.href = "/";
											}}
										>
											<div className="relative flex items-center justify-center">
												<FiLogOut />
											</div>

											<div className="relative font-semibold text-xs">
												{"Logout"}
											</div>
										</button>
									</>
								) : null}
							</div>
						</div>
					</div>
				</div>

				{/* tabs */}
				<div className="relative h-full w-1/2">
					<div className="relative w-full h-14 overflow-hidden flex items-center justify-between gap-6 px-5">
						<div className="relative flex items-center gap-5">
							{/* firebase icon */}
							<div className="relative flex items-center justify-center text-blue-600">
								<FiFolder size={20} />
							</div>

							{/* title */}
							<div className="relative font-semibold text-sm text-gray-800 text-left">
								{"Tabs"}
							</div>
						</div>

						{/* add tab btn */}
						<button
							type="button"
							className="relative w-9 h-9 cursor-pointer border-none outline-none rounded-lg text-gray-800 bg-gray-100 flex items-center justify-center"
							title="Add Tab"
							onClick={() => {
								const __oldTabValue = localStorage.tabValueForTemplate
									? JSON.parse(localStorage.tabValueForTemplate)
									: null;

								if (__oldTabValue) {
									alert(
										"Tab Already Exists, \n Please complete that first."
									);
								} else {
									setAddTab(!addTab);
								}
							}}
						>
							<FiPlus size={24} />
						</button>
					</div>

					{/* grids */}
					<div className="relative w-full h-[calc(100%-3.5rem)] overflow-hidden">
						<div className="relative w-full h-full px-4 overflow-auto">
							<div className="relative w-full h-auto grid gap-1 border-t py-4">
								{/* add tab input field */}
								{addTab ? (
									<>
										<div className="relative w-full h-auto mb-2">
											<form
												onSubmit={handleTabInputValue}
												className="relative w-full h-auto"
											>
												<div className="relative w-full h-auto flex items-center justify-center">
													<input
														className={
															"relative w-full h-10 rounded-lg bg-white duration-300 ring-3 ring-blue-600 " +
															(tabValue && tabValue.length >= 1
																? "ring-opacity-100"
																: "ring-opacity-50") +
															" focus:ring-opacity-100 font-semibold text-sm text-gray-700 placeholder-gray-500 px-4 outline-none"
														}
														placeholder="Enter tab name"
														ref={tabInputFieldRef}
														onKeyUp={(event) =>
															setTabValue(event.target.value)
														}
														defaultValue={
															tabValue ? tabValue : ""
														}
														autoFocus
														required
														minLength={3}
														maxLength={15}
													/>

													{/* loading icon */}
													{checking ? (
														<>
															<div className="absolute h-full w-12 flex items-center justify-center bg-transparent z-30 right-0 top-0">
																<div className="relative animate-spin text-blue-600 flex items-center justify-center">
																	<FiLoader size={24} />
																</div>
															</div>
														</>
													) : null}
												</div>

												{/* error message */}
												{tabErr.error ? (
													<>
														<div className="relative h-5 mt-3 font-medium text-sm text-red-500">
															{tabErr.error ? tabErr.text : ""}
														</div>
													</>
												) : null}
											</form>
										</div>
									</>
								) : null}

								<Tabs />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
