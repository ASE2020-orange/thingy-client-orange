<template>
<main>
	<section class="container text-center pt-4">
		<div v-if="profile">
			<h1>{{profile.name}}</h1>
			<img v-bind:src="profile.avatar_url" />
			<h3>Location : {{profile.location}}</h3>
			<h3>Bio : {{profile.bio}}</h3>
		</div>
		<div v-else>You are not connected</div>
	</section>
	<section class="container text-center pt-4">
		<div v-if="profile">
			<h1> Dashboard </h1>
			<h3> Number of quizzes done  </h3>
			<div> {{ nb_quizzes }} </div>
			<h3> Number of questions answered </h3>
			<div> {{ nb_answers }} </div>
			<h3> Number of correct answers </h3>
			<div> {{ nb_correct_answers }} </div>
			<h3> Number of wrong answers </h3>
			<div> {{ nb_wrong_answers }} </div>
			<h3> Percent of correct answers </h3>
			<div> {{ percent_of_correct_answer }}% </div>
			<h3> Average reaction time </h3>
			<div> {{ avg_reaction_time }} seconds </div>
		</div>
	</section>
</main>
</template>

<script>
export default {
	data: () => {
		return {
			profile: false,
			nb_quizzes: 0,
			nb_answers: 0,
			nb_correct_answers: 0,
			nb_wrong_answers: 0,
			percent_of_correct_answer: 0,
			avg_reaction_time: 0
		};
	},
	methods: {
		getProfile() {
			fetch(`${this.http_prefix}${this.server_address}/api/profile/`, {
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
					this.getUserStats();
				})
				.catch((err) => console.log(err))
		},
		getUserStats() {
            fetch(`${this.http_prefix}${this.server_address}/api/user/${this.profile.id}/stats/`, {
                method: "get",
            })
            .then((res) => {
                return res.json();
            })
            .catch((err) => console.log(err))
            .then((data) => {
				this.nb_quizzes = data["nb_quizzes"]
				this.nb_answers = data["nb_answers"];
				this.nb_correct_answers = data["nb_correct_answers"];
                this.nb_wrong_answers = data["nb_wrong_answers"];
				this.percent_of_correct_answer = data["percent_of_correct_answer"];
				this.avg_reaction_time = data["avg_reaction_time"];
            })
            .catch((err) => console.log(err));
		}
	},
	mounted() {
		// try to get the profile if the jwt is set
		let jwt = window.localStorage.getItem("jwt")
		if (jwt != "undefined") {
			this.getProfile();
		}
	}
}
</script>

<style>

</style>
