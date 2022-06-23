/* eslint-disable */
import React from "react";
import { Route, Routes } from "react-router-dom";

// Pages
import { HomePage, Page404 } from "./pages";
import AddTemplate from "./pages/addTemplate";
import AdsManager from "./pages/ads";
import HomePageContent from "./pages/home/content";
import SearchBg from "./pages/searchBg";
import SearchTags from "./pages/tags";
import Templates from "./pages/templates";
import AllTemplates from "./pages/templates/templates";

const App = () => {
	return (
		<>
			<div className="relative w-screen h-screen overflow-hidden bg-white">
				<Routes>
					<Route path="/*" element={<HomePage />}>
						<Route index element={<HomePageContent />} />
						<Route path="templates" element={<AllTemplates />} />
						<Route path="search-tags" element={<SearchTags />} />
						<Route path="manage-ads" element={<AdsManager />} />
						<Route path="add-template" element={<AddTemplate />} />
						<Route path="search-background" element={<SearchBg />} />
						<Route path="tab:tab" element={<Templates />} />

						<Route path="*" element={<Page404 />} />
					</Route>
				</Routes>
			</div>
		</>
	);
};

export default App;
