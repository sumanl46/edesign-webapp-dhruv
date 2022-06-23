import React from "react";

export default function Page404() {
	return (
		<>
			<div className="relative w-full h-full flex items-center justify-center">
				<div className="relative w-auto h-auto grid gap-10">
					{/* 404 */}
					<div className="relative text-center font-extrabold tracking-wider text-9xl text-gray-800">
						{"404"}
					</div>

					{/* page info */}
					<div className="relative font-medium tracking-wider text-base text-red-500 text-center">
						{"Page not found"}
					</div>
				</div>
			</div>
		</>
	);
}
