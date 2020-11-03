const SERVER_ADRESS = "127.0.0.1:8080";

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
        this.server = connectWS();
    },
    data: {
        question: undefined,
        answers: undefined,
        category: undefined,
        game_id: -1
    },
    methods: {
        new_game: create_game
    }
})

function create_game() {
    fetch(`http://${SERVER_ADRESS}/api/games/`, {
            method: 'get'
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            vm.game_id = data.game_id;
            getQuestion();
        }).catch(err => console.log(err))
}

async function getQuestion() {
    fetch(`http://${SERVER_ADRESS}/api/games/${vm.game_id}/question/`, {
            method: 'get'
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            vm.answers = data.answers;
            vm.question = data.question;
            vm.category = data.category;
            document.body.style.backgroundColor = "white";
        }).catch(err => console.log(err))
}

async function asnwerQuestion(answer_id) {
    fetch(`http://${SERVER_ADRESS}/api/games/${vm.game_id}/question/`, {
            method: 'post',
            body: JSON.stringify({'answer_id': answer_id})
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            if (data.correct){
                document.body.style.backgroundColor = "green";
                getQuestion();
            }else{
                document.body.style.backgroundColor = "red";
            }
        }).catch(err => console.log(err))
}

async function connectWS() {
    console.log("Starting connection to WebSocket Server")
    let server = new WebSocket(`ws://${SERVER_ADRESS}/ws`)

    server.onopen = (event) => {
        console.log(event)
        console.log("Successfully connected to the websocket server...")
    }

    server.onmessage = (event) => {
        if (event.data.startsWith("TO_CLIENT")) {
            let action = event.data.split('.')[1];
            let thingy = event.data.split('.')[2];

            console.log(`${action} from ${thingy}`);

            switch(action){
                case 'FLIP_A':
                    asnwerQuestion(0);
                    break;
                case 'FLIP_B':
                    asnwerQuestion(1);
                    break;
                case 'FLIP_C':
                    asnwerQuestion(2);
                    break;
            }

        }
    }

    return server;
}