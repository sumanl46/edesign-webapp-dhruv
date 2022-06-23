import React from "react";
import News from "./news";
import Notification from "./notification";
import RemoveBg from "./removeBg";

export default function HomePageContent() {
	return (
		<>
			<div className="relative w-full h-full overflow-auto">
				{/* Remove bg section :top */}
				<div className="relative w-full h-auto border-b px-6 py-4 flex items-center justify-start">
					<RemoveBg />
				</div>

				{/* Notification section :middle */}
				<div className="relative w-full h-auto px-6 py-4">
					<Notification />
				</div>

				{/* News section :below-top */}
				<div className="relative w-full h-auto overflow-hidden">
					<News />
				</div>
			</div>
		</>
	);
}
