/* eslint-disable */
import React, { useEffect, useState } from "react";
import { db, __messaging } from "../../../firebase-config";
import { collection, doc, getDocs } from "firebase/firestore";

export default function Notification() {
	const [tokens, setTokens] = useState([]);
	const [msg, setMsg] = useState("Review our new templates.");
	const [title, setTitle] = useState("Edesign");

	const tokensRefAndroid = doc(db, "fcm_token", "android");
	const tokensRefTokens = collection(tokensRefAndroid, "tokens");

	const getToken = async () => {
		const response = await getDocs(tokensRefTokens);

		if (response.empty) {
			console.log("You don't any tokens to send notifications.");
		} else {
			setTokens(response.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
		}
	};

	const sendNotification = async () => {
		// Send the token to your server and update the UI if necessary
		if (tokens.length > 0) {
			var key =
				"AAAALh3a8kQ:APA91bGnKaybqed-foUZpY2Kj0EsVByAVXqP0tXe3oEpB38nBe1kpqTpHKE924CRgGjPezQQvTQLoE_k3DDoWy6-gRUNPR9iYdsmT6J_g1fC7V6gQAPxFmPkHETq8kZEbFNx1ZiNcje_";
			var notification = {
				title: title,
				body: msg,
			};

			tokens.forEach((token) => {
				fetch("https://fcm.googleapis.com/fcm/send", {
					method: "POST",
					headers: {
						Authorization: "key=" + key,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						notification: notification,
						to: token.token,
					}),
				})
					.then(function (response) {
						console.log("%cSent ✅", "font-weight: 600; color: #3498DB");
					})
					.catch(function (error) {
						console.error(error);
					});
			});
		} else {
			alert("Token is not loaded yet.");
		}
	};

	useEffect(() => {
		getToken();
	}, []);

	return (
		<>
			<div className="relative w-full h-auto grid gap-4 divide-y">
				<div className="relative w-auto text-left font-semibold text-lg text-gray-800">
					{"Notification"}
				</div>

				{/* grids */}
				<form
					action="#"
					onSubmit={(e) => e.preventDefault()}
					className="relative w-full h-auto grid gap-5 py-3"
				>
					{/* title */}
					<div className="relative w-9/12 h-auto grid gap-2">
						<label
							htmlFor="notificationTitle"
							className="relative font-medium text-base text-gray-800"
						>
							{"Title"}
						</label>

						<div className="relative w-full min-w-[8rem] h-12">
							<input
								type={"text"}
								placeholder="Notification Title"
								required
								id="notificationTitle"
								minLength={2}
								maxLength={100}
								defaultValue={"Edesign"}
								onKeyUp={(e) => setTitle(e.target.value)}
								className="relative w-full h-full px-4 py-2 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-base text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-200 focus:border-white ring-0 ring-blue-600 focus:ring-2"
							/>
						</div>
					</div>

					{/* link */}
					<div className="relative w-9/12 h-auto grid gap-2">
						<label
							htmlFor="notificationMsg"
							className="relative font-medium text-base text-gray-800"
						>
							{"Body"}
						</label>

						<div className="relative w-full min-w-[8rem] h-auto">
							<textarea
								type={"text"}
								placeholder="Notification Body"
								required
								id="notificationMsg"
								minLength={4}
								maxLength={400}
								cols={150}
								defaultValue={"Review our new templates"}
								onKeyUp={(e) => setMsg(e.target.value)}
								className="relative w-full h-full px-4 py-2 text-left bg-gray-100 focus:bg-gray-200 duration-200 font-medium text-base text-gray-700 placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-200 focus:border-white ring-0 ring-blue-600 focus:ring-2"
							/>
						</div>
					</div>

					<button
						type={"submit"}
						className="relative w-24 h-12 px-4 py-2 text-left bg-blue-500 focus:bg-blue-600 duration-200 font-medium text-base text-white placeholder-gray-500 outline-none rounded-xl border-[1px] focus:border-[3px] border-gray-200 focus:border-white ring-0 ring-blue-600 focus:ring-2 flex items-center justify-center"
						onClick={sendNotification}
					>
						<div>{"Send"}</div>
					</button>
				</form>
			</div>
		</>
	);
}
