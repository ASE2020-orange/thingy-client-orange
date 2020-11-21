<template>
<div class="auth">
	<a v-bind:href="github_url">Connect with Github</a>
	<!-- <a v-bind:href="github_url">Connect with ...</a> -->
	<div v-if="profile">
		<p>Welcome {{profile.name}}</p>
		<img v-bind:src="profile.avatar_url" />
	</div>
</div>
</template>

<script>
export default {
	name: 'Auth',
	data: () => {
		return {
			github_url: "",
			server_adress: "127.0.0.1:1080",
			profile: false
		};
	},
	methods: {
		connect_github(code) {
			fetch(`http://${this.server_adress}/auth/`, {
					method: "post",
					body: JSON.stringify({
						"code": code
					})
				}).then((res) => {
					console.log(res);
					return res.json();
				})
				.then((data) => {
					this.profile = data;
				})
				.catch((err) => console.log(err));
			console.log(code);
		}
	},
	mounted() {
		fetch(`http://${this.server_adress}/auth/`, {
				method: "get",
			}).then((res) => {
				return res.json();
			})
			.then((data) => {
				console.log(data);
				this.github_url = data.github;
			})
			.catch((err) => console.log(err));
		let url_string = window.location.href;
		let url = new URL(url_string);
		let code = url.searchParams.get("code");
		if (code != undefined)
			this.connect_github(code);
	}
}
</script>
