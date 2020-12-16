<template>
<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
	<a class="navbar-brand" href="#">Thingy Quizz</a>

	<ul class="navbar-nav mr-auto">
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
	<div class="navbar-text">
		<div v-if="profile">
			<span class="p-2">
				Welcome {{profile.name}} !
			</span>
			<img class="rounded-circle" v-bind:src="profile.avatar_url" height="38px" padding="0" margin="0" />
			<button type="button" class="ml-2 btn btn-primary" v-on:click="logoff">
				Logoff
			</button>
		</div>
		<div v-else>
			<button type="button" class="btn btn-primary" v-on:click="logoff">
				<a v-bind:href="urls.github">Login with Github</a>
			</button>
		</div>
	</div>
</nav>
</template>

<script>
export default {
	data: () => {
		return {
			urls: {},
			profile: false
		};
	},
	methods: {
		getOauthUrls() {
			fetch(`${this.http_prefix}${this.server_address}/oauth/`, {
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
			fetch(`${this.http_prefix}${this.server_address}/oauth/`, {
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
			fetch(`${this.http_prefix}${this.server_address}/oauth/`, {
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
			fetch(`${this.http_prefix}${this.server_address}/profile/`, {
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
};
</script>

<style scoped>

</style>
