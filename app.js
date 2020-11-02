Vue.component('category', {
    props: ['category'],
    template: `
      <h1>Category: {{category}}</h1>
    `
})

Vue.component('question', {
    props: ['question'],
    template: `
      <h2>{{question}}</h2>
    `
})

Vue.component('answer', {
    props: ['answer'],
    template: `
      <h3>{{answer.answer}}</h3>
    `
})

var vm = new Vue({
    el: '#app',
    mounted() {
        getQuestion();
    },
    data: {
        question: undefined,
        answers: undefined,
        category: undefined
    }
})

async function getQuestion() {
    fetch('http://127.0.0.1:8000/api/games/42/question/', {
            method: 'get'
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            vm.answers = data.answers;
            vm.question = data.question;
            vm.category = data.category;
        }).catch(err => console.log(err))
}