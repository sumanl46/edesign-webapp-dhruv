/* eslint-disable */
import React, { createContext, useState, useEffect } from "react";

import { query, orderBy, getDocs, collection } from "firebase/firestore";

import { db } from "../firebase-config";

export const MainContext = createContext(null);

export function MainContextProvider({ children }) {
	const [contextData, setContextData] = useState({
		signedIn: false,
		addTemplateTo: "",
		addedTemplateTo: "",
	});
	const [tabChanged, setTabChanged] = useState(null);

	const [tabs, setTabs] = useState([]);

	const tabsCollectionRef = collection(db, "tabs");
	const orderedTabsCollectionRef = query(
		tabsCollectionRef,
		orderBy("orderId", "asc")
	);

	const getCookie = (cname) => {
		let name = cname + "=";
		let ca = document.cookie.split(";");
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == " ") {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				return c.substring(name.length, c.length);
			}
		}
		return "";
	};

	const checkCookie = () => {
		const email = getCookie("email");
		const password = getCookie("email");
		if (email != "" && password != "") {
			return true;
		} else {
			return false;
		}
	};

	useEffect(() => {
		const __addTemplateTo = localStorage.getItem("tabValueForTemplate");
		const value = __addTemplateTo ? JSON.parse(__addTemplateTo) : "";

		const loggedIn = checkCookie();

		setContextData({
			...contextData,
			signedIn: loggedIn,
			addTemplateTo: value,
		});
	}, []);

	const loadTabs = async (callback) => {
		const response = await getDocs(orderedTabsCollectionRef);

		callback(response.docs);
	};

	useEffect(() => {
		// if (tabChanged == null) return;
		// else {
		loadTabs((datas) => {
			if (datas.empty) {
				console.log("No tabs found");
			} else {
				setTabs(datas.map((data) => ({ ...data.data(), id: data.id })));
			}
		}, []);
		// }
	}, [tabChanged]);

	return (
		<MainContext.Provider
			value={{
				mainDataOnly: contextData,
				mainData: [contextData, setContextData],
				tabs: tabs,
				tabsData: [tabs, setTabs],
				tabChange: setTabChanged,
			}}
		>
			{children}
		</MainContext.Provider>
	);
}
