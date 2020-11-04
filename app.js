const SERVER_ADRESS = "127.0.0.1:8080";
var notyf = new Notyf({
    position: ({
        x: 'center',
        y: 'top'
    })
});

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
    props: ['answer', 'position'],
    template: `
    <b-list-group-item>
        <img
        title="icon by Aman from the Noun Project"
        height="50px" width="50px"
        v-bind:src="answer.position">
        {{answer.answer}}
    </b-list-group-item>
    `
})

var vm = new Vue({
    el: '#app',
    mounted() {
        connectWS().then((ws_server) => {
            vm.ws_server = ws_server;
        });
        window.addEventListener('unload', (event) => {
            vm.ws_server.send("close");
            vm.ws_server.close();
        });
    },
    data: {
        question: undefined,
        answers: [{
            answer: undefined,
            svg_style: undefined,
            position: undefined
        }],
        category: undefined,
        game_id: -1,
        selected_answer: -1,
        game_started: false
    },
    methods: {
        new_game: new_game,
        isAnswerSelectedClass: isAnswerSelectedClass
    }
})

function new_game() {
    fetch(`http://${SERVER_ADRESS}/api/games/`, {
            method: 'get'
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            vm.game_id = data.game_id;
            vm.game_started = true;
            getQuestion();
        }).catch(err => console.log(err))
}
let positions = ["./img/normal.svg", "./img/side.svg", "./img/upside_down.svg"];
async function getQuestion() {
    fetch(`http://${SERVER_ADRESS}/api/games/${vm.game_id}/question/`, {
            method: 'get'
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            vm.answers = data.answers;
            vm.answers.forEach(x => {
                x.position = positions[vm.answers.indexOf(x)];
                x.answer = decodeHTML(x.answer);
            });
            vm.question = decodeHTML(data.question);
            vm.category = data.category;
        }).catch(err => console.log(err))
}

function showToaster(variant, title, answer_id) {
    vm.$bvToast.toast(`${vm.answers[answer_id].answer}`, {
        title: title,
        variant: variant,
        toaster: 'b-toaster-top-center',
        noCloseButton: true
    })
}

async function asnwerQuestion(answer_id) {
    fetch(`http://${SERVER_ADRESS}/api/games/${vm.game_id}/question/`, {
            method: 'post',
            body: JSON.stringify({
                'answer_id': answer_id
            })
        }).then(res => {
            return res.json();
        }).catch(err => console.log(err))
        .then(data => {
            if (data.correct) {
                showToaster('success', 'Correct answer', answer_id);
                getQuestion();
            } else {
                showToaster('danger', 'Wrong answer', answer_id);
            }
        }).catch(err => console.log(err))
}

function selectAnswer(answer_id) {
    vm.selected_answer = answer_id;
}

async function connectWS() {
    console.log("Starting connection to WebSocket Server");
    let server = new WebSocket(`ws://${SERVER_ADRESS}/ws`);

    server.onopen = (event) => {
        console.log(event);
        server.send("CLIENT_CONNECT");
        console.log("Successfully connected to the websocket server...");
    }

    server.onmessage = (event) => {
        if (event.data.startsWith("TO_CLIENT")) {
            let action = event.data.split('.')[1];
            let thingy = event.data.split('.')[2];

            console.log(`${action} from ${thingy}`);

            switch (action) {
                case 'FLIP_A':
                    selectAnswer(0);
                    break;
                case 'FLIP_B':
                    selectAnswer(1);
                    break;
                case 'FLIP_C':
                    selectAnswer(2);
                    break;
                case 'BUTTON':
                    if (vm.selected_answer != -1) {
                        asnwerQuestion(vm.selected_answer);
                    }
                    break;
            }

        }
    }

    return server;
}

function isAnswerSelectedClass(index) {
    if (index == vm.selected_answer) {
        return "bg-info text-light selected_answer";
    } else {
        return "bg-light text-black";
    }
}

function decodeHTML(html) {
    var txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
};