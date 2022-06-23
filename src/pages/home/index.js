/* eslint-disable */
import React, { useContext, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { FiGlobe } from "react-icons/fi";
import SideBarContainer from "./components/sidebar-container";
import { MainContext } from "../../contexts/MainContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config";

export default function HomePage() {
	const { mainDataOnly: contextData } = useContext(MainContext);

	const [email, setEmail] = useState(null);
	const [password, setPassword] = useState(null);

	const [internet, setInternet] = useState(false);

	const [user, setUser] = useState(null);

	const setCookie = (cname, cvalue, exdays) => {
		const d = new Date();
		d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
		let expires = "expires=" + d.toUTCString();
		document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	};

	const submitForm = () => {
		if (email && password) {
			if (user) {
				if (email === user.email && password === user.password) {
					setCookie("email", email, 30);
					setCookie("password", password, 30);

					window.location.reload();
				} else {
					alert("Failed to login\nEmail or password is not matched");
				}
			} else {
				alert("User not found");
			}
		} else {
			return;
		}
	};

	const userReference = collection(db, "authentication");

	const fetchUser = async () => {
		await getDocs(userReference)
			.then((data) => {
				data.docs.map((doc) => {
					const { email, password } = doc.data();

					setUser({
						email: email,
						password: password,
					});
				});
			})
			.catch((error) => console.log(error));
	};

	useEffect(() => {
		const connection = window.navigator.onLine;

		if (connection) fetchUser();

		setInternet(connection);
	}, []);

	return (
		<>
			{/* If No Internet Connection */}
			{internet ? null : (
				<>
					<div className="relative w-full h-auto py-4 bg-blue-600 flex justify-center items-center">
						<div className="relative flex items-center justify-center gap-6">
							<FiGlobe color="#FFFFFF" size={25} />

							<div className="relative text-white text-base">
								{"No Internet Connection"}
							</div>
						</div>
					</div>
				</>
			)}

			{/* Other contents */}
			{contextData.signedIn ? (
				<>
					<div className="relative w-full h-full overflow-hidden bg-transparent flex divide-x">
						{/* Absolute box over the content */}
						{internet ? null : (
							<>
								<div className="absolute z-50 left-0 top-0 w-full h-full bg-gray-800/50"></div>
							</>
						)}

						{/* Sidebar */}
						<div className="relative h-full w-4/12 min-w-[400px] max-w-[600px] flex divide-x bg-gray-50">
							<SideBarContainer />
						</div>

						{/* Main Content Container */}
						<div className="relative h-full w-8/12 overflow-hidden bg-white">
							<Outlet />
						</div>
					</div>
				</>
			) : (
				<>
					<div className="relative w-full h-full flex justify-center items-center bg-gray-100">
						<div className="relative w-96 min-w-[18rem] max-w-[30rem] h-auto p-10 rounded-3xl bg-white border">
							<div className="relative w-full h-auto flex items-center justify-center">
								<div className="relative w-auto h-auto grid justify-items-center gap-6">
									<div className="relative font-extrabold text-4xl text-gray-800">
										{"Dashboard"}
									</div>

									<div className="font-medium text-sm inline-flex items-center gap-1 text-gray-600">
										<span className="relative w-4 h-[1px] bg-blue-600"></span>
										<span>{"Login to Continue"}</span>
										<span className="relative w-4 h-[1px] bg-blue-600"></span>
									</div>
								</div>
							</div>

							{/* form */}
							<form
								action="#"
								onSubmit={(e) => {
									e.preventDefault();
								}}
								className="relative w-full h-auto grid gap-4 mt-10"
							>
								<div className="relative w-full h-auto grid gap-3">
									{/* email */}
									<div className="relative w-full h-11">
										<input
											type={"email"}
											required
											className="relative w-full h-full outline-none border border-gray-200 ring-blue-600/40 focus:ring-4 focus:border-blue-600 duration-200 font-medium text-sm text-left px-4 rounded-lg"
											placeholder="Email"
											autoFocus
											onKeyUp={(e) => setEmail(e.target.value)}
										/>
									</div>

									{/* password */}
									<div className="relative w-full h-11">
										<input
											type={"password"}
											required
											className="relative w-full h-full outline-none border border-gray-200 ring-blue-600/40 focus:ring-4 focus:border-blue-600 duration-200 font-medium text-sm text-left px-4 rounded-lg"
											placeholder="Password"
											onKeyUp={(e) => setPassword(e.target.value)}
										/>
									</div>
								</div>

								{/* submit */}
								<div className="relative w-full h-11">
									<button
										type={"submit"}
										className="relative w-full h-full outline-none cursor-pointer bg-blue-600 focus:border-2 border-white focus:bg-blue-700 ring-blue-600 focus:ring-2 duration-200 font-medium text-white text-base text-center rounded-xl"
										onClick={submitForm}
									>
										{"Login"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</>
			)}
		</>
	);
}
