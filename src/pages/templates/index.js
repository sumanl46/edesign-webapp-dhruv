/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

// icons
import { FiBox, FiTrash, FiLoader, FiPlus } from "react-icons/fi";
import {
	collection,
	getDocs,
	where,
	query,
	doc,
	deleteDoc,
	orderBy,
} from "firebase/firestore";
import { db, __storage } from "../../firebase-config";
import Template from "./template";
import { MainContext } from "../../contexts/MainContext";
import { ref, deleteObject } from "firebase/storage";

const Empty = ({ tab, navigate, deleteTab }) => {
	const { mainData, tabs } = useContext(MainContext);

	const [contextData, setContextData] = mainData;

	const [tabNotFound, setTabNotFound] = useState(false);

	useEffect(() => {
		const __tabs = [...tabs];
		const __tabIndex = __tabs.findIndex((t) => t.key === tab);

		if (__tabIndex > -1) {
			return;
		} else {
			setTabNotFound(true);
		}
	}, [tab]);

	return (
		<>
			<div className="relative w-full h-full flex items-center justify-center">
				<div className="relative w-auto h-auto grid gap-10">
					<div className="relative flex items-center justify-center text-gray-800">
						<FiBox size={150} />
					</div>

					<div className="relative text-center font-semibold text-base text-gray-700">
						{tabNotFound ? "Tab not found" : "Templates not found"}
					</div>

					{tabNotFound ? null : (
						<>
							<div className="relative w-auto h-auto grid gap-3 justify-items-center">
								{/* add template */}
								<button
									type="button"
									className="relative outline-none focus:border-2 border-white focus:ring-2 ring-blue-600 duration-200 cursor-pointer px-8 h-11 rounded-xl bg-blue-500 text-white flex items-center justify-center gap-5"
									onClick={() => {
										setContextData({
											...contextData,
											addTemplateTo: tab,
										});

										let __tab = "";
										let minusFound = false;
										for (let i = 0; i < tab.length; i++) {
											if (i == 0) {
												__tab = tab[i].toUpperCase();

												continue;
											} else if (tab[i] == "-") {
												minusFound = true;

												continue;
											} else if (minusFound) {
												__tab += " " + tab[i].toUpperCase();

												minusFound = false;
											} else {
												__tab += tab[i];
											}
										}

										localStorage.tabValueFromTemplate =
											JSON.stringify(__tab);

										navigate("/add-template");
									}}
								>
									<div className="relative flex items-center justify-center">
										<FiPlus size={24} />
									</div>

									<div className="relative font-semibold text-sm">
										{"Add Template"}
									</div>
								</button>

								{/* delete tab */}
								<button
									type="button"
									className="relative outline-none focus:border-2 border-white focus:ring-2 ring-red-600 duration-200 cursor-pointer px-8 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center gap-5"
									onClick={deleteTab}
								>
									<div className="relative flex items-center justify-center">
										<FiTrash size={20} />
									</div>

									<div className="relative font-semibold text-sm">
										{"Delete Tab"}
									</div>
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		</>
	);
};

export default function Templates() {
	const { mainData, tabsData } = useContext(MainContext);

	const [contextData, setContextData] = mainData;
	const [tabs, setTabs] = tabsData;

	let navigate = useNavigate();

	const params = useParams();

	const [templates, setTemplates] = useState([]);

	const [empty, setEmpty] = useState(false);

	const [fetching, setFetching] = useState(false);

	const templatesCollectionRef = collection(db, "templates");

	const search = query(
		templatesCollectionRef,
		where("key", "==", params.tab.replace(":", "")),
		orderBy("createdAt", "desc")
	);

	// delete collection permanently,
	const __deleteTab = async () => {
		const __tabs = [...tabs];
		const __tab = params.tab.replace(":", "");

		let __ID = null;
		__tabs.map((tab) => {
			if (tab.key === __tab) {
				__ID = tab.id;

				return;
			}
		});

		if (__ID) {
			const deleteTabRef = doc(db, "tabs", __ID);

			await deleteDoc(deleteTabRef)
				.then(() => {
					const removedTabIndex = __tabs.findIndex((t) => t.id === __ID);

					__tabs.splice(removedTabIndex, 1);

					setTabs(__tabs);

					navigate("/tab:" + __tab);
				})
				.catch((error) => console.log(error));
		} else {
			alert("ID not found");
		}
	};

	// update template image and set docs in firestore,
	const __deleteTemplate = async (template, id) => {
		const confirmed = confirm("Delete this template");

		if (confirmed) {
			const templateId = template.imgId;

			templates.splice(id, 1);

			setTemplates([...templates]);

			// find and delete template,
			const deleteTemplateRef = doc(db, "templates", template.id);

			const __filename = `images/${templateId}`;

			// reference deleting tempate from storage,
			const deletingTemplateRef = ref(__storage, __filename);

			await deleteDoc(deleteTemplateRef)
				.then(async () => {
					await deleteObject(deletingTemplateRef)
						.then((res) => console.log(res))
						.catch((error) => {
							console.log(error);
						});
				})
				.catch((error) => {
					console.log(error);
				});
		} else {
			return;
		}
	};

	const fetchTemplates = async (callback) => {
		setFetching(true);

		const response = await getDocs(search);

		callback(response.docs);
	};

	useEffect(() => {
		fetchTemplates((docs) => {
			if (docs.length <= 0) {
				setEmpty(true);
			} else {
				setTemplates(docs.map((doc) => ({ ...doc.data(), id: doc.id })));

				setEmpty(false);
			}

			setFetching(false);
		}, []);
	}, [params]);

	if (fetching) {
		return (
			<>
				<div className="relative w-full h-full flex items-center justify-center">
					<div className="relative text-blue-500 flex items-center justify-center duration-1000 ease-linear animate-spin">
						<FiLoader size={24} />
					</div>
				</div>
			</>
		);
	} else {
		return (
			<>
				{empty ? (
					<Empty
						tab={params.tab.replace(":", "")}
						deleteTab={__deleteTab}
						navigate={navigate}
					/>
				) : (
					<>
						<div className="relative w-full h-full overflow-hidden">
							{/* top part of the templates page */}
							<div className="relative w-full h-14 border-b bg-gray-50 px-4 flex items-center justify-between">
								<div className="relative flex items-center gap-3 font-semibold text-base text-gray-800">
									<div>
										{params.tab
											.replace(":", "")
											.charAt(0)
											.toUpperCase() +
											params.tab
												.replace(":", "")
												.slice(
													1,
													params.tab.replace(":", "").length
												) +
											" Templates"}
									</div>

									<div className="relative rounded-md bg-gray-200 px-2 py-1 text-gray-700 text-sm">
										{templates.length}
									</div>
								</div>

								{/* add template btn */}
								<button
									type="button"
									onClick={() => {
										let tab = params.tab.replace(":", "");

										setContextData({
											...contextData,
											addTemplateTo: tab,
										});

										let __tab = "";
										let minusFound = false;
										for (let i = 0; i < tab.length; i++) {
											if (i == 0) {
												__tab = tab[i].toUpperCase();

												continue;
											} else if (tab[i] == "-") {
												minusFound = true;

												continue;
											} else if (minusFound) {
												__tab += " " + tab[i].toUpperCase();

												minusFound = false;
											} else {
												__tab += tab[i];
											}
										}

										localStorage.tabValueFromTemplate =
											JSON.stringify(__tab);

										navigate("/add-template");
									}}
									className="relative outline-none focus:border-2 border-white focus:ring-2 ring-blue-600 duration-200 cursor-pointer px-4 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center gap-5"
								>
									<div className="relative flex items-center justify-center">
										<FiPlus size={24} />
									</div>

									<div className="relative font-semibold text-xs">
										{"Add"}
									</div>
								</button>
							</div>

							{/* templates grid */}
							<div className="relative w-full h-[calc(100%-3.5rem)] overflow-auto">
								<div className="relative w-full h-auto grid col-auto 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-0 flex-wrap">
									{templates.map((template, index) => (
										<div
											key={index}
											className="relative w-full h-80 overflow-hidden p-4"
										>
											<Template
												template={template}
												deleteTemplate={() => {
													__deleteTemplate(template, index);
												}}
											/>
										</div>
									))}
								</div>
							</div>
						</div>
					</>
				)}
			</>
		);
	}
}
