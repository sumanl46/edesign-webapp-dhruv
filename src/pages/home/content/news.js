/* eslint-disable */
import React, { useEffect, useState } from "react";
import { FiDelete, FiPlus } from "react-icons/fi";

import { db, __storage } from "../../../firebase-config";
import {
	ref,
	getDownloadURL,
	uploadString,
	deleteObject,
} from "firebase/storage";
import {
	collection,
	addDoc,
	getDocs,
	doc,
	deleteDoc,
} from "firebase/firestore";

export default function News() {
	const [showModal, setShowModal] = useState(false);
	const [allNews, setAllNews] = useState([]);

	const [thumbnail, setThumbnail] = useState("");
	const [url, setUrl] = useState("");

	const newsCollectionRef = collection(db, "news");

	const handleFileInput = (evt) => {
		const file = evt.target.files[0];

		if (file && evt.target.files.length >= 1) {
			const reader = new FileReader();

			reader.readAsDataURL(file);

			reader.onloadend = (e) => {
				setThumbnail(reader.result);
			};
		} else {
			console.log("File is empty");
		}
	};

	const handleUrlInput = (evt) => {
		const __txt = evt.target.value;

		setUrl(__txt.trim());
	};

	const loadAllNews = async () => {
		const response = await getDocs(newsCollectionRef);

		if (response.empty) {
			setAllNews([]);

			alert("You Don't have any News");
		} else {
			setAllNews(
				response.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
			);
		}
	};

	const addNewsToCollection = async () => {
		const date = new Date();
		const imgId = date.getTime();
		const __loc = `images/${imgId}`;

		const imageStorageRef = ref(__storage, __loc);

		await uploadString(imageStorageRef, thumbnail, "data_url")
			.then(async (res) => {
				await getDownloadURL(res.ref)
					.then(async (thumbnailUrl) => {
						await addDoc(newsCollectionRef, {
							url: url,
							thumbnail: thumbnailUrl,
							loc: __loc,
						})
							.then(() => {
								loadAllNews();

								setShowModal(false);

								alert("News Added");
							})
							.catch((error) => {
								alert("Failed to upload news");

								console.log(error);
							});
					})
					.catch((error) => {
						alert(
							"Failed to get downloaded url, Please go and delete this image and upload a new one! 😊"
						);

						console.log(error);
					});
			})
			.catch((error) => {
				alert("Failed to upload image");

				console.log(error);
			});
	};

	const deleteNews = async (id, filePath) => {
		const deleteNewsRef = doc(db, "news", id);
		const deletingNewsRef = ref(__storage, filePath);

		let confirmed = confirm("Delete this template");

		if (confirmed) {
			await deleteObject(deletingNewsRef)
				.then(async () => {
					await deleteDoc(deleteNewsRef)
						.then(() => {
							loadAllNews();

							alert(`Successfully delete news with id \n ${id}`);
						})
						.catch((error) => {
							alert("Failed to delete news");

							console.log(error);
						});
				})
				.catch((error) => {
					alert("Failed to delete news image from storage, \nTry Again");

					console.log(error);
				});
		} else {
			return;
		}
	};

	useEffect(() => {
		loadAllNews();
	}, []);

	return (
		<>
			<div className="w-full h-auto px-6 py-4 grid gap-4 divide-y sticky">
				{/* absolute add news section */}
				{showModal ? (
					<>
						<div className="fixed w-full h-full bg-gray-800/50 left-0 top-0 z-60 duration-200">
							<form
								action="#"
								encType="multipart/form-data"
								onSubmit={(e) => e.preventDefault()}
								className="relative w-full h-full flex items-center justify-center duration-200"
							>
								<div className="relative w-auto min-w-[250px] max-w-[400px] h-auto p-6 bg-white rounded-3xl duration-200 grid gap-0">
									{/* Url Input Box */}
									<div className="relative w-full h-16 py-2">
										<input
											type={"url"}
											required
											autoFocus
											minLength={15}
											maxLength={500}
											placeholder="News URL or Link eg:https/example.com"
											className="relative w-full h-full px-4 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-base text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-300 focus:border-white ring-0 ring-blue-600 focus:ring-2"
											onKeyUp={handleUrlInput}
										/>
									</div>
									{/* Title Input Box */}
									<div className="relative w-full h-16 py-2">
										<input
											type={"file"}
											required
											accept="image/x-png, image/jpg, image/jpeg"
											className="relative w-full h-full py-2 px-4 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-base text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-300 focus:border-white ring-0 ring-blue-600 focus:ring-2 flex items-center"
											onChange={handleFileInput}
										/>
									</div>

									{/* Submit Btn */}
									<div className="relative w-full h-14 pt-2 flex items-center justify-end gap-5">
										<button
											type={"submit"}
											className="relative w-auto h-full px-4 text-center bg-gray-200 focus:bg-gray-300 duration-200 font-medium text-base text-gray-800 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-300 focus:border-white ring-0 ring-gray-500 focus:ring-2"
											onClick={() => setShowModal(false)}
										>
											Cancel
										</button>

										<button
											type={"submit"}
											className="relative w-auto h-full px-4 text-center bg-blue-600 focus:bg-blue-700 duration-200 font-medium text-base text-gray-50 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-300 focus:border-white ring-0 ring-blue-600 focus:ring-2"
											onClick={addNewsToCollection}
										>
											Add News
										</button>
									</div>
								</div>
							</form>
						</div>
					</>
				) : null}

				<div className="relative w-full h-auto flex items-center gap-4">
					<div className="relative bg-gray-200 border-2 border-white ring-1 ring-gray-300 rounded-lg px-4 py-1 w-auto text-left font-medium text-lg text-gray-800">
						{"News"}
					</div>

					<button
						type="button"
						className="relative w-10 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center cursor-pointer duration-200 border-0 border-white focus:border-2 ring-blue-600 focus:ring-2"
						onClick={() => setShowModal(true)}
					>
						<FiPlus size={24} />
					</button>
				</div>

				{/* content */}
				<div className="relative w-full h-auto overflow-auto">
					<div className="relative w-auto h-auto flex flex-wrap items-start justify-start py-3">
						{allNews.length >= 1 ? (
							<>
								{allNews.map((_news, index) => (
									<div key={index} className="relative w-44 h-44 p-2">
										<div className="relative w-full h-full overflow-hidden hover:shadow-lg group rounded-xl duration-200 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 bg-gray-50">
											<a
												className="relative w-full h-full no-underline"
												href={_news.url}
												target={"_blank"}
											>
												<img
													alt={_news.url}
													title={_news.url}
													src={_news.thumbnail}
													className="relative w-full h-full"
												/>
											</a>

											{/* absolute delete option */}
											<div className="absolute w-full h-10 -bottom-[100px] left-0 opacity-0 duration-200 z-30 bg-gray-800/20 p-1 group-hover:bottom-0 group-hover:opacity-100">
												<button
													type="button"
													onClick={(e) => {
														e.preventDefault();

														deleteNews(_news.id, _news.loc);
													}}
													className="relative w-full h-full rounded-md outline-none border-none px-2 duration-200 bg-red-500 hover:bg-red-600 flex items-center justify-center gap-2"
												>
													<div className="relative font-medium text-sm text-white">
														{"Delete News"}
													</div>

													<FiDelete size={18} color="#FFFFFF" />
												</button>
											</div>
										</div>
									</div>
								))}
							</>
						) : (
							<div className="relative font-semibold text-base text-gray-700">
								{"You don't have any news."}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
