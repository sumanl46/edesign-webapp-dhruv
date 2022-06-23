import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function CustomLink({ to, title, children }) {
	const location = useLocation();

	let matched = false;

	if (location.pathname.replace("/", "") === to.replace("/", "")) {
		matched = true;
	}

	return (
		<>
			<Link
				to={to}
				className={
					"relative w-full h-11 rounded-xl " +
					(matched
						? "bg-blue-500 hover:bg-blue-600 text-white"
						: "text-gray-700 hover:bg-gray-100") +
					" px-4 flex items-center gap-4 duration-300"
				}
			>
				<div className="relative flex items-center justify-center">
					{children}
				</div>

				<div className="relative font-semibold text-xs">{title}</div>
			</Link>
		</>
	);
}
