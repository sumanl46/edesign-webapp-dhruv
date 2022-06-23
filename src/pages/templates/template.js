/* eslint-disable */
import React, { useState } from "react";
import { FiTrash } from "react-icons/fi";
import { HiSun, HiOutlineSun } from "react-icons/hi";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";

export default function Template({ template, deleteTemplate }) {
	const [popular, setPopular] = useState(template.popular);

	const popularTemplateRef = doc(db, "templates", template.id);

	// add to popular templates,
	const __makeItPopularTemplate = async () => {
		await updateDoc(popularTemplateRef, {
			popular: !popular,
		})
			.then(() => {
				setPopular(!popular);
			})
			.catch((error) => console.log(error));
	};

	return (
		<>
			<div
				className={
					"relative w-full h-full group rounded-3xl flex items-center justify-center bg-black overflow-hidden border-4 border-white ring-2 " +
					(template.popular ? "ring-blue-600" : "ring-gray-200")
				}
			>
				<img
					src={template.image}
					alt={template.key}
					className="absolute z-20 w-full h-full rounded-xl flex items-center justify-center"
				/>

				{/* other details */}
				<div className="absolute z-30 opacity-0 group-hover:opacity-100 duration-300 left-0 top-0 w-full h-full bg-gradient-to-t from-gray-900 to-transparent flex justify-start items-end">
					{/* add or remove from popular templates and update btns */}
					<div className="absolute z-40 right-10 top-0 h-auto w-auto p-2 flex items-center justify-center gap-3">
						<button
							type="button"
							title="Add to popular templates"
							onClick={() => __makeItPopularTemplate(template)}
							className="relative duration-300 top-1 group-hover:top-0 opacity-20 group-hover:opacity-100 cursor-pointer border-none outline-none focus:ring-2 ring-blue-200 flex items-center justify-center w-8 h-8 rounded-lg p-[2px]"
						>
							{popular ? (
								<>
									<div className="relative w-full h-full rounded-md bg-white text-blue-500 flex items-center justify-center">
										<HiSun size={16} />
									</div>
								</>
							) : (
								<>
									<div className="relative w-full h-full rounded-md bg-white text-gray-800 flex items-center justify-center">
										<HiOutlineSun size={16} />
									</div>
								</>
							)}
						</button>
					</div>

					{/* delete and update btns */}
					<div className="absolute z-40 right-0 top-0 h-auto w-auto p-2 flex items-center justify-center gap-3">
						<button
							type="button"
							title="Change template"
							onClick={deleteTemplate}
							className="relative duration-300 top-1 group-hover:top-0 opacity-20 group-hover:opacity-100 cursor-pointer border-none outline-none focus:ring-2 ring-blue-200 flex items-center justify-center w-8 h-8 rounded-lg p-[2px]"
						>
							<div className="relative w-full h-full rounded-md bg-white text-red-400 flex items-center justify-center">
								<FiTrash size={16} />
							</div>
						</button>
					</div>

					<div className="relative w-full h-auto grid px-4">
						<div className="relative flex items-center justify-between py-2 border-b border-gray-700">
							<div className="relative flex items-center font-semibold text-sm text-white">
								{"Tags"}
							</div>
						</div>

						{/* tags container */}
						<div className="relative w-auto h-auto py-2 duration-300 top-3 group-hover:top-0">
							{/* tags */}
							<div className="relative w-full h-auto overflow-auto flex flex-wrap gap-3 justify-start items-start">
								{template.tags.map((tag, id) => (
									<div
										key={id}
										className="relative px-2 py-1 rounded-md bg-gray-600/50 font-semibold text-xs text-white"
									>
										{tag}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
