<template>
<main>
	<section class="container text-center pt-4">
        <h1> Dashboard of user {{ userId }} </h1>
        <h3> Number of correct answers </h3>
		<div> {{ nb_correct_answers }} </div>
	</section>
</main>
</template>

<script>
export default {
    data () {
        return {
            userId: 1,
            nb_correct_answers: 'no answers'
        }
    },
	methods: {
        getNbCorrectAnswers(userId) {
            fetch(`http://${this.server_adress}/answers/users/${userId}`, {
                method: "get",
            })
            .then((res) => {
                return res.json();
            })
            .catch((err) => console.log(err))
            .then((data) => {
                var nb_answers = data['nb_answers'];
                var answers = data['answers'];
                var nb_correct_answers = 0;
                for (var i = 0; i < nb_answers; i++) {
                    var answer = answers[i];
                    if (answer['is_correct']) {
                        nb_correct_answers++;
                    }
                }
                this.nb_correct_answers = nb_correct_answers;
            })
            .catch((err) => console.log(err));

            this.nb_correct_answers = userId;
        }
	},
	mounted() {
        this.getNbCorrectAnswers(1);
    }
}
</script>

<style>

</style>
