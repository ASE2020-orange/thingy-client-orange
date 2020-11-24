<template>
<div id="app">
	<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
		<a class="navbar-brand" href="#">Thingy Quizz</a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbarNavDropdown">
			<ul class="navbar-nav">
				<li class="nav-item">
					<router-link to="/" class="nav-link">Home</router-link>
				</li>
				<li class="nav-item">
					<router-link to="/profile" class="nav-link">Profile</router-link>
				</li>
				<li class="nav-item">
					<router-link to="/game" class="nav-link">Game</router-link>
				</li>
			</ul>
		</div>
		<span class="navbar-text">
			<div v-if="profile">
				Welcome : {{profile.name}} ! <img v-bind:src="profile.avatar_url" height="30px" padding="0" margin="0" />
				<button v-on:click="logoff">Log off</button>
			</div>
			<div v-else><a v-bind:href="urls.github">Login with Github</a></div>
		</span>
	</nav>
	<router-view />
</div>
</template>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	height: 100%;
}
</style>

<script>
export default {
	name: "Auth",
	data: () => {
		return {
			urls: {},
			profile: false
		};
	},
	methods: {
		getOauthUrls() {
			fetch(`${this.http_prefix}${this.server_adress}/oauth/`, {
					method: "get",
				})
				.then((res) => {
					return res.json()
				})
				.then((data) => {
					this.urls = data.urls
				})
				.catch((err) => console.log(err));
		},
		login(code) {
			fetch(`${this.http_prefix}${this.server_adress}/oauth/`, {
					method: "post",
					body: JSON.stringify({
						"code": code
					}),
				})
				.then((res) => {
					return res.json()
				})
				.then((data) => {
					window.localStorage.setItem("jwt", data.jwt)
					window.location.replace("/")
				})
				.catch((err) => console.log(err))
		},
		logoff() {
			fetch(`${this.http_prefix}${this.server_adress}/oauth/`, {
					method: "delete",
					headers: {
						"Authorization": "Bearer " + window.localStorage.getItem("jwt")
					}
				})
				.then((res) => {
					return res.json()
				})
				.then(() => {
					window.localStorage.removeItem("jwt")
					window.location.replace("/")
					this.profile = false
				})
				.catch((err) => console.log(err))
		},
		getProfile() {
			fetch(`${this.http_prefix}${this.server_adress}/profile/`, {
					method: "get",
					headers: {
						"Authorization": "Bearer " + window.localStorage.getItem("jwt")
					},
				})
				.then((res) => {
					return res.json()
				})
				.then((data) => {
					this.profile = data.profile
				})
				.catch((err) => console.log(err))
		}
	},
	mounted() {
		// Check if the user come back from OAuth Authentication
		let url = new URL(window.location.href)
		let code = url.searchParams.get("code")
		if (code != undefined)
			this.login(code)

		// Get the url for the
		this.getOauthUrls()

		// try to get the profile if the jwt is set
		let jwt = window.localStorage.getItem("jwt")
		if (jwt != "undefined") {
			this.getProfile()
		}

	}
}
</script>
