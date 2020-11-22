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
					<!-- <router-link to="/profile" class="nav-link">Profile</router-link> -->
					<a class="nav-link">Profile</a>
				</li>
				<li class="nav-item">
					<router-link to="/game" class="nav-link">Game</router-link>
				</li>
			</ul>
		</div>
		<span class="navbar-text">
			<div v-if="profile">
				Welcome {{profile.name}} <img v-bind:src="profile.avatar_url" height="30px" padding="0" margin="0" />
			</div>
			<div v-else><a v-bind:href="urls.github">Connect with Github</a></div>
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
}

#nav {
	padding: 30px;
}

#nav a {
	font-weight: bold;
	color: #2c3e50;
}

#nav a.router-link-exact-active {
	color: #42b983;
}
</style>

<script>
export default {
	name: 'Auth',
	data: () => {
		return {
			urls: {},
			server_adress: "127.0.0.1:1080",
			profile: false
		};
	},
	methods: {
		connect() {
			fetch(`http://${this.server_adress}/auth/`, {
					method: "get",
					credentials: "include"
				})
				.then((res) => {
					return res.json();
				})
				.then((data) => {
					this.urls = data.urls;
					this.profile = data.profile;
					console.log(data);
				})
				.catch((err) => console.log(err));
		},
		login(code) {
			fetch(`http://${this.server_adress}/auth/`, {
					method: "post",
					body: JSON.stringify({
						"code": code
					}),
					credentials: "include"
				})
				.then((res) => {
					return res.json();
				})
				.then((data) => {
					this.urls = data.urls;
					this.profile = data.profile;
					console.log(data);
				})
				.catch((err) => console.log(err));
		},
	},
	mounted() {
		let url = new URL(window.location.href);
		let code = url.searchParams.get("code");
		if (code != undefined)
			this.login(code);
		else
			this.connect()
	}
}
</script>
