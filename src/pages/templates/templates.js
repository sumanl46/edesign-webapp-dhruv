/* eslint-disable */
import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

// icons
import { FiBox, FiLoader, FiPlus } from "react-icons/fi";
import {
	collection,
	getDocs,
	doc,
	deleteDoc,
	query,
	orderBy,
} from "firebase/firestore";
import { db, __storage } from "../../firebase-config";
import Template from "./template";
import { ref, deleteObject } from "firebase/storage";

const Empty = () => {
	return (
		<>
			<div className="relative w-full h-full flex items-center justify-center">
				<div className="relative w-auto h-auto grid gap-10">
					<div className="relative flex items-center justify-center text-gray-800">
						<FiBox size={150} />
					</div>

					<div className="relative text-center font-semibold text-lg text-gray-700">
						{"Templates not found"}
					</div>
				</div>
			</div>
		</>
	);
};

export default function AllTemplates() {
	const [templates, setTemplates] = useState([]);

	const navigate = useNavigate();

	const [empty, setEmpty] = useState(false);

	const [fetching, setFetching] = useState(false);

	// Filtering templates
	const [filterBy, setFilterBy] = useState({
		title: null,
		order: "asc",
		key: null,
	});
	const [selectTabClicked, setSelectTabClicked] = useState(false);

	const filterOptions = [
		{
			title: "Popular",
			key: "popular",
			order: "desc",
		},
		{
			title: "Latest",
			key: "createdAt",
			order: "desc",
		},
		{
			title: "Oldest",
			key: "createdAt",
			order: "asc",
		},
	];

	const templatesCollectionRef = collection(db, "templates");
	const orderedTemplatesCollectionRef = query(
		templatesCollectionRef,
		orderBy("createdAt", "desc")
	);

	// update template image and set docs in firestore,
	const __deleteTemplate = async (template, id) => {
		let confirmed = confirm("Delete this template");

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

	const fetchTemplates = async (q, callback) => {
		setFetching(true);

		const response = await getDocs(q);

		callback(response.docs);
	};

	// Order Templates
	const orderTemplates = async () => {
		const collectionRef = collection(db, "templates");
		const filter = await query(
			collectionRef,
			orderBy(filterBy.key, filterBy.order)
		);

		fetchTemplates(
			filter,
			(docs) => {
				if (docs.length <= 0) {
					setEmpty(true);
				} else {
					setTemplates(docs.map((doc) => ({ ...doc.data(), id: doc.id })));

					setEmpty(false);
				}

				setFetching(false);
			},
			[]
		);
	};

	const __setTabValueOnClick = (id) => {
		setFilterBy(filterOptions[id] ? filterOptions[id] : "Invalid");
	};

	useEffect(() => {
		if (filterBy.title == null) return;

		orderTemplates();
	}, [filterBy]);

	useEffect(() => {
		fetchTemplates(
			orderedTemplatesCollectionRef,
			(docs) => {
				if (docs.length <= 0) {
					setEmpty(true);
				} else {
					setTemplates(docs.map((doc) => ({ ...doc.data(), id: doc.id })));

					setEmpty(false);
				}

				setFetching(false);
			},
			[]
		);
	}, []);

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
					<Empty />
				) : (
					<>
						<div className="relative w-full h-full overflow-auto">
							{/* top part of the templates page */}
							<div className="relative w-full h-14 border-b bg-gray-50 px-4 flex items-center justify-between">
								<div className="relative flex items-center gap-3 font-semibold text-base text-gray-800">
									<div>{"All Templates"}</div>

									<div className="relative rounded-md bg-gray-200 px-2 py-1 text-gray-700 text-sm">
										{templates.length}
									</div>
								</div>

								{/* add template btn */}
								<div className="relative flex items-center justify-center gap-3">
									<div className="relative w-40 h-auto z-60">
										<button
											type="button"
											className={
												"relative w-auto h-11 px-5 border-white focus:border-2 focus:ring-2 " +
												(filterBy.title == null ||
												filterBy.title.length <= 0
													? "focus:ring-gray-200 bg-gray-100 text-gray-800"
													: " ring-indigo-600 bg-indigo-500 text-white") +
												" duration-100 rounded-xl cursor-pointer overflow-hidden flex items-center"
											}
											onClick={() => {
												const __oldTabValue =
													localStorage.tabValueForTemplate
														? JSON.parse(
																localStorage.tabValueForTemplate
														  )
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
												{filterBy.title
													? filterBy.title
													: "Filter By"}
											</div>
										</button>

										{/* absolute dropdown */}
										{selectTabClicked && (
											<div className="absolute z-60 left-0 top-[55px] duration-200 border w-full h-auto rounded-xl bg-white shadow-sm">
												<div className="absolute z-10 left-7 -top-2 rounded-md rotate-45 w-6 h-6 border bg-white"></div>

												<div className="relative z-20 w-full h-auto grid gap-1 p-1 rounded-xl bg-white">
													{filterOptions.map((filter, index) => (
														<div
															key={index}
															className={
																"relative w-full h-10 rounded-lg px-4 cursor-pointer duration-200 " +
																(filterBy.title === filter.title
																	? "bg-gray-100"
																	: "hover:bg-gray-100") +
																" flex items-center"
															}
															onClick={() => {
																__setTabValueOnClick(index);
															}}
														>
															<div className="relative font-semibold text-xs text-gray-700">
																{filter.title}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>

									<button
										type="button"
										onClick={() => {
											navigate("/add-template");
										}}
										className="relative outline-none focus:border-2 border-white focus:ring-2 ring-blue-600 duration-200 cursor-pointer px-4 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center gap-5"
									>
										<div className="relative flex items-center justify-center">
											<FiPlus size={24} />
										</div>

										<div className="relative font-semibold text-sm">
											{"Add Template"}
										</div>
									</button>
								</div>
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
												deleteTemplate={() =>
													__deleteTemplate(template, index)
												}
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
