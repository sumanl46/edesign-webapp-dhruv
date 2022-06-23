/* eslint-disable */
import React, { useContext } from "react";

import Tab from "./tab";
import { MainContext } from "../../../contexts/MainContext";

const Empty = ({ info }) => {
	return (
		<>
			<div className="relative w-full h-full flex items-center">
				<div className="relative font-semibold text-xs text-gray-700">
					{info ? info : "No Tabs"}
				</div>
			</div>
		</>
	);
};

export default function Tabs() {
	const { tabs, tabChange } = useContext(MainContext);

	const changedTab = () => {
		tabChange("Change");
	};

	return (
		<>
			{window.navigator.onLine == false ? (
				<>
					<Empty info="No Internet" />
				</>
			) : tabs.length <= 0 ? (
				<Empty info="Empty tabs" />
			) : (
				<>
					{tabs.map((tab, index) => (
						<Tab key={index} tab={tab} onChanged={changedTab} />
					))}
				</>
			)}
		</>
	);
	// }
}
