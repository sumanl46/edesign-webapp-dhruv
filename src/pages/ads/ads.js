/* eslint-disable */
import React, { useEffect, useState } from "react";

import { db, __storage } from "../../firebase-config";
import {
	collection,
	getDocs,
	doc,
	deleteDoc,
	updateDoc,
	query,
	orderBy,
	serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { FiBox, FiGlobe, FiLoader, FiStar, FiTrash } from "react-icons/fi";
import { AiOutlineSync } from "react-icons/ai";

export default function AdsGrid() {
	const [ads, setAds] = useState([]);

	const [pinnedAd, setPinnedAd] = useState(null);

	const [fetched, setFetched] = useState(false);

	const adsCollectionRef = collection(db, "ads");

	const getAds = async (callback) => {
		setFetched(false);
		const queried = query(
			adsCollectionRef,
			orderBy("pinned", "desc"),
			orderBy("createdAt", "desc")
		);
		const response = await getDocs(queried);

		setAds(response.docs.map((doc) => ({ ...doc.data(), id: doc.id })));

		return callback("Fetched");
	};

	const pinAd = async (ad, index) => {
		if (ads.length <= 1 && ad.pinned == true) {
			alert(
				"You have only one ad left so you can't unpinned the ad.\nAdd another ad to unpin it."
			);
		} else {
			const prevPinnedAd = doc(db, "ads", pinnedAd.id);
			const __pinnedAd = doc(db, "ads", ad.id);

			if (index == pinnedAd.index) {
				return;
			} else {
				await updateDoc(prevPinnedAd, {
					pinned: false,
				})
					.then(async () => {
						await updateDoc(__pinnedAd, {
							pinned: true,
						}).then(() => {
							const __ads = [...ads];
							__ads[pinnedAd.index].pinned = false;
							__ads[index].pinned = true;

							setPinnedAd({ ...ad, index: index });

							const pinnedIndex = __ads.findIndex(
								(ad) => ad.pinned == true
							);

							let temp = __ads[0];
							__ads[0] = __ads[pinnedIndex];
							__ads[pinnedIndex] = temp;

							setAds(__ads);
						});
					})
					.catch((error) => console.log(error));
			}
		}
	};

	const updateAd = async (ad, i) => {
		const upAdDoc = doc(db, "ads", ad.id);

		await updateDoc(upAdDoc, {
			createdAt: serverTimestamp(),
		}).then(() => {
			const __ads = [...ads];
			let temp = __ads[1];
			__ads[1] = __ads[i];
			__ads[i] = temp;

			setAds(__ads);
		});
	};

	const deleteActiveAd = async ({ id, loc }) => {
		let confirmed = confirm("Delete this template");

		const deleteAdRef = doc(db, "ads", id);
		const deleteImgRef = ref(__storage, loc);
		if (confirmed) {
			await deleteObject(deleteImgRef).then(async () => {
				await deleteDoc(deleteAdRef)
					.then(() => {
						getAds(() => {
							setFetched(true);
						}, []);

						alert(`Done\nDeleted image at location ${loc} && ID:${id}`);
					})
					.catch((error) => {
						alert(
							"Failed to delete.\nPlease visit the console for more info"
						);

						console.log(error);
					});
			});
		} else {
			return;
		}
	};

	useEffect(() => {
		if (window.navigator.onLine) {
			getAds(() => {
				setFetched(true);
			}, []);
		} else {
			setFetched(true);
		}
	}, []);

	if (fetched && ads.length >= 1) {
		return (
			<>
				<div className="relative w-full h-auto p-4 grid col-auto 2xl:grid-cols-3 xl:grid-cols-3 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 grid-cols-1 gap-3 flex-wrap">
					{ads.map((ad, index) => (
						<div
							key={index}
							onLoad={() => {
								if (ad.pinned) setPinnedAd({ ...ad, index: index });
							}}
							className="relative w-full h-80 overflow-hidden rounded-xl bg-gray-100 group"
						>
							<a
								href={ad.link}
								target="_blank"
								className="relative w-full h-full no-underline"
							>
								<img
									src={ad.thumbnail}
									alt={ad.thumbnail ? ad.thumbnail : "ads-thumbnail"}
									className="relative w-full h-full flex items-center justify-center"
								/>
							</a>

							{/* absolute delete options */}
							<div className="absolute w-full h-auto -bottom-4 left-0 z-30 pb-4 opacity-0 group-hover:opacity-100 group-hover:bottom-0 duration-200 flex items-center justify-center bg-gradient-to-t from-gray-600 to-transparent">
								<div className="relative w-9/12 h-10 border-none rounded-lg duration-200 cursor-pointer text-white outline-none bg-indigo-600 flex items-center justify-between gap-0 divide-x divide-indigo-400 overflow-hidden">
									{/* Delete the ad */}
									<button
										type="button"
										title="Delete the ad"
										onClick={() => {
											if (ad.pinned) {
												alert(
													"This is only one left ad and it is pinned so you can't delete.\nChange the pinned ad by adding another ad to continue deleting."
												);
											} else {
												deleteActiveAd(ad);
											}
										}}
										className="relative w-6/12 h-full duration-300 hover:bg-indigo-700  flex items-center justify-center gap-4 outline-none border-none"
									>
										<FiTrash size={20} />

										<span>{"Delete"}</span>
									</button>

									{/* Pin the ad to the top */}
									<button
										type="button"
										title="Pinn the ad to top."
										onClick={() => pinAd(ad, index)}
										className="relative w-3/12 h-full duration-300 flex items-center justify-center hover:bg-indigo-800"
									>
										<FiStar
											size={20}
											fill={ad.pinned ? "#FFFFFF" : "transparent"}
										/>
									</button>

									{/* Update Ad */}
									<button
										type="button"
										title="This is SET your new date, which keep it to the first place."
										onClick={() => updateAd(ad, index)}
										className="relative w-3/12 h-full duration-300 flex items-center justify-center hover:bg-indigo-800"
									>
										<AiOutlineSync size={20} />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</>
		);
	} else if (fetched && ads.length <= 0) {
		return (
			<>
				<div className="relative w-full h-full flex items-center justify-center">
					<div className="relative w-auto h-auto grid gap-4 justify-items-center">
						<div className="relative flex items-center justify-center text-gray-700">
							<FiBox size={124} />
						</div>

						<div className="relative font-semibold text-sm text-blue-500">
							{"No Ads"}
						</div>
					</div>
				</div>
			</>
		);
	} else {
		return (
			<>
				<div className="relative w-full h-full flex items-center justify-center">
					{window.navigator.onLine ? (
						<>
							<div className="relative w-auto h-auto grid gap-4 justify-items-center">
								<div className="relative flex items-center justify-center w-auto h-auto animate-spin duration-100">
									<FiLoader size={24} color="#3498DB" />
								</div>

								<div className="relative text-center font-medium text-xs text-gray-700">
									{"Fetching ads"}
								</div>
							</div>
						</>
					) : (
						<>
							<div className="relative w-auto h-auto grid gap-4 justify-items-center">
								<div className="relative flex items-center justify-center w-auto h-auto animate-spin duration-100">
									<FiGlobe size={124} color="#00000090" />
								</div>

								<div className="relative text-center font-medium text-xs text-gray-700">
									{"No Internet Connection"}
								</div>
							</div>
						</>
					)}
				</div>
			</>
		);
	}
}
