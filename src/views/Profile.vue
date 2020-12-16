<template>
<main>
	<section class="container text-center pt-4">
		<div v-if="profile">
			<h1>{{profile.name}}</h1>
			<img v-bind:src="profile.avatar_url" />
			<p class="h3">Location :: {{profile.location}}</p>
			<p class="h3">Bio : {{profile.bio}}</p>
		</div>
		<div v-else>You are not connected</div>
	</section>
	<section class="container text-center pt-4">
		<div v-if="profile">
			<h1> Dashboard </h1>
			<div class="card justify-content-center">
				<div class="card-header">
					Number of quizzes done	
  				</div>
				<div class="card-body">
					{{ nb_quizzes }}
				</div>
			</div>
			<div class="card justify-content-center">
				<div class="card-header">
					Number of questions answered
				</div>
				 <div class="card-body">
					{{ nb_answers }}
				 </div>
			</div>
			<div class="card justify-content-center">
				<div class="card-header">
					Number of correct answers
				</div>
				<div class="card-body">
					{{ nb_correct_answers }} 
				</div>
			 </div>
			<div class="card justify-content-center">
				<div class="card-header">
					Number of wrong answers
				</div>
				<div class="card-body">
					{{ nb_wrong_answers }}
				</div>
			</div>
			<div class="card justify-content-center">
				<div class="card-header">
					Percent of correct answers
				</div>
				<div class="card-body">
					{{ percent_of_correct_answer }}%
				</div>
			</div>
			<div class="card justify-content-center">
				<div class="card-header">
					Average reaction time
				</div>
				<div class="card-body">
					{{ avg_reaction_time|round }} seconds
				</div>
			</div>
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
			avg_reaction_time: Math.round(1.2123123 * 10) / 10,
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
				this.avg_reaction_time = Math.round(this.avg_reaction_time * 10) / 10;
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
