<template>
<main>
	<section class="container text-center pt-4">
		<div v-if="profile">
			<h1>Name : {{profile.name}}</h1>
			<img v-bind:src="profile.avatar_url" />
		</div>
		<div v-else>You are not connected</div>
	</section>
</main>
</template>

<script>
export default {
	data: () => {
		return {
			server_adress: "127.0.0.1:1080",
			profile: false
		};
	},
	methods: {
		getProfile() {
			fetch(`http://${this.server_adress}/profile/`, {
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
		// try to get the profile if the jwt is set
		let jwt = window.localStorage.getItem("jwt")
		if (jwt != "undefined") {
			this.getProfile()
		}
	}
}
</script>

<style>

</style>
