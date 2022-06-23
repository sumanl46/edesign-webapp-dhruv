/* eslint-disable */
import React, { useState, useEffect } from "react";

import { FiPlus, FiX } from "react-icons/fi";
import { db } from "../../firebase-config";

import {
	collection,
	getDocs,
	updateDoc,
	setDoc,
	doc,
} from "firebase/firestore";

export default function SearchTags() {
	const [allTags, setAllTags] = useState([]);
	const [addedSearchTags, setAddedSearchTags] = useState([]);

	const allTagsRef = collection(db, "templates");
	const searchTagsRef = collection(db, "search_tags");

	const fetchAllTags = async (callback) => {
		const response = await getDocs(allTagsRef);

		setAllTags([]);

		if (response.empty) {
			return callback("Failed");
		}

		response.docs.map((doc) => {
			const { tags } = doc.data();

			tags.map((tag, id) => {
				if (Object.keys(allTags).length <= 0 || allTags.length <= 0)
					allTags.push({ tag: tag, id: id, added: false });

				let found = allTags.findIndex((__tag) => __tag.tag === tag);

				if (found <= -1) {
					allTags.push({ tag: tag, id: id, added: false });
				}
			});
		});

		setAllTags([...allTags]);

		return callback("Done");
	};

	const fetchAllSearchTags = async (callback) => {
		const response = await getDocs(searchTagsRef);

		setAddedSearchTags([]);

		if (response.empty) {
			setAddedSearchTags({ tags: [], id: undefined });

			return callback([{ tags: [] }]);
		}

		response.docs.map((doc) => {
			const { tags } = doc.data();

			setAddedSearchTags({ tags: [...tags], id: doc.id });

			return callback(tags);
		});
	};

	// add tag to search list,
	const addTagToSearch = async (tag, id) => {
		let __tempAddedSearchTags = [...addedSearchTags.tags];
		__tempAddedSearchTags.push(tag.tag);

		let __tempAllTags = [...allTags];
		__tempAllTags[id].added = true;

		const updateTagsRef = doc(db, "search_tags", "tags");

		if (addedSearchTags.length > 0) {
			await updateDoc(updateTagsRef, {
				tags: __tempAddedSearchTags,
			})
				.then(() => {
					setAddedSearchTags({
						tags: __tempAddedSearchTags,
						id: "tags",
					});

					setAllTags(__tempAllTags);
				})
				.catch((err) => console.log(err));
		} else {
			await setDoc(updateTagsRef, {
				tags: __tempAddedSearchTags,
			})
				.then(() => {
					setAddedSearchTags({
						tags: __tempAddedSearchTags,
						id: "tags",
					});

					setAllTags(__tempAllTags);
				})
				.catch((err) => console.log(err));
		}
	};

	// delete that tag,
	const deleteTag = async (tag, id) => {
		let __tempAddedSearchTags = [...addedSearchTags.tags];
		__tempAddedSearchTags.splice(id, 1);

		const deleteTagsRef = doc(db, "search_tags", "tags");

		await updateDoc(deleteTagsRef, {
			tags: __tempAddedSearchTags,
		})
			.then(() => {
				setAddedSearchTags({
					tags: __tempAddedSearchTags,
					id: "tags",
				});

				// add colors to the already added tags,
				let __tempAllTags = [...allTags];
				let matched = allTags.findIndex((t) => tag === t.tag);

				if (matched >= 0) {
					__tempAllTags[matched].added = false;
				}

				setAllTags(__tempAllTags);
			})
			.catch((err) => console.log(err));
	};

	// run all the startup functions,
	const runFetch = async () => {
		await fetchAllSearchTags(async (res) => {
			if (res.length > 0) {
				await fetchAllTags(() => {
					// add colors to the already added tags,
					let __tempAllTags = [...allTags];

					allTags.forEach((tag, id) => {
						let matched = res.findIndex((t) => tag.tag === t);
						if (matched >= 0) {
							__tempAllTags[id].added = true;
						}
					});

					setAllTags([...__tempAllTags]);
				}, []);
			} else {
				return;
			}
		}, []);
	};

	useEffect(() => {
		if (allTags.length > 0 && addedSearchTags.length > 0) {
			const __filteredTags = [];
			allTags.forEach((tg) => {
				if (addedSearchTags.tags.indexOf(tg.tag) > -1) {
					__filteredTags.push(tg.tag);
				} else {
					return;
				}
			});

			setAddedSearchTags({
				...addedSearchTags,
				tags: [...__filteredTags],
			});
		} else {
			return;
		}
	}, [allTags, addedSearchTags]);

	// let's load all tags at first run,
	useEffect(() => {
		runFetch();
	}, []);

	return (
		<>
			<div className="relative w-full h-full flex overflow-hidden divide-x">
				<div className="relative w-1/2 h-full overflow-hidden">
					<div className="relative w-full h-14 min-h-[3.5rem] px-6 flex items-center justify-between border-b">
						<div className="relative flex items-center gap-3 font-semibold text-lg text-gray-800">
							<span>{"All Tags"}</span>
							<span className="relative px-2 py-1 text-gray-700 text-sm rounded-md bg-gray-100">
								{allTags.length}
							</span>
						</div>
					</div>

					<div className="relative w-full h-full overflow-auto p-5">
						<div className="relative w-full h-auto flex gap-4 flex-wrap justify-start">
							{/* all tags available in templates */}
							{allTags.length <= 0 ? (
								"No tags found in your templates."
							) : (
								<>
									{allTags.map((tag, index) => (
										<div
											key={index}
											className="relative px-4 py-2 max-w-max rounded-md cursor-pointer group duration-200 hover:bg-gray-100 bg-gray-50 text-center flex gap-2"
											onClick={() => {
												if (tag.added) return;

												addTagToSearch(tag, index);
											}}
										>
											<div
												className={
													"relative duration-200 " +
													(tag.added
														? "text-indigo-500"
														: "group-hover:text-indigo-500 text-gray-700") +
													" font-medium text-sm"
												}
											>
												{tag ? tag.tag : ""}
											</div>

											{tag.added ? null : (
												<>
													<div className="relative flex items-center justify-center text-blue-500">
														<FiPlus size={18} />
													</div>
												</>
											)}
										</div>
									))}
								</>
							)}
						</div>
					</div>
				</div>
				<div className="relative w-1/2 h-full overflow-hidden">
					<div className="relative w-full h-14 min-h-[3.5rem] px-6 flex items-center justify-between border-b">
						<div className="relative flex items-center gap-3 font-semibold text-lg text-gray-800">
							<span>{"Added Search Tags"}</span>
							<span className="relative px-2 py-1 text-gray-700 text-sm rounded-md bg-gray-100">
								{addedSearchTags.tags && addedSearchTags.tags.length}
							</span>
						</div>
					</div>

					<div className="relative w-full h-full overflow-auto p-5">
						<div className="relative w-full h-auto flex gap-4 flex-wrap justify-start">
							{/* all added search tags available in search_tags */}
							{addedSearchTags.length <= 0 ||
							addedSearchTags.tags.length <= 0 ? (
								"You haven't added any search-tags."
							) : (
								<>
									{addedSearchTags.tags.map((tag, index) => (
										<div
											key={index}
											onClick={() => deleteTag(tag, index)}
											className="relative px-4 py-2 max-w-max rounded-md cursor-pointer group duration-200 hover:bg-gray-100 bg-gray-50 text-center flex gap-2"
										>
											<div className="relative font-medium duration-200 group-hover:text-indigo-700 text-indigo-500 text-sm">
												{tag ? tag : ""}
											</div>

											{/* delete tag */}
											<div className="relative text-gray-300 duration-300 flex group-hover:text-red-500 items-center justify-center">
												<FiX size={16} />
											</div>
										</div>
									))}
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
