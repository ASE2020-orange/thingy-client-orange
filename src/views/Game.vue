<template>
<div class="Game">
  <b-container fluid>
  <b-row class="vh-100 text-center" align-v="center">
    <b-col>
        <category v-bind:category="category"></category>
        <question v-bind:question="question"></question>
        <b-list-group horizontal class="justify-content-center">
          <answer v-bind:key="answer.id" v-bind:class="isAnswerSelectedClass(index)" v-bind:answer="answer" v-for="(answer, index) in answers"></answer>
        </b-list-group>
    </b-col>
  </b-row>
</b-container>
</div>
</template>

<script>
import Category from "@/components/Category.vue";
import Question from "@/components/Question.vue";
import Answer from "@/components/Answer.vue";

export default {
  name: "Game",
  components: {
    Category,
    Question,
    Answer,
  },
  created() {
    this.start_game();
  },
    data: () => {
      return {
        server_adress: "127.0.0.1:1080",
        ws_server: undefined,
        positions: [
          require("@/assets/normal.svg"),
          require("@/assets/side.svg"),
          require("@/assets/upside_down.svg"),
        ],
        position_titles: ["Normal", "On the side", "Upside down"],
        question: undefined,
        answers: new Array(),
        category: undefined,
        game_id: -1,
        selected_answer: -1,
        false_answers: new Array(),
      };
    },
    methods: {
      start_game() {
        fetch(`http://${this.server_adress}/api/games/`, {
          method: "get",
        })
          .then((res) => {
            return res.json();
          })
          .catch((err) => console.log(err))
          .then((data) => {
            this.game_id = data.game_id;
            this.getQuestion();
          })
          .catch((err) => console.log(err));
      },
      isAnswerSelectedClass(index) {
        if (index == this.selected_answer && this.false_answers.includes(index)) {
          return "bg-info text-danger selected_wrong_answer";
        } else if (index == this.selected_answer) {
          return "bg-info text-light selected_answer";
        } else if (this.false_answers.includes(index)) {
          return "bg-danger text-light selected_answer";
        } else {
          return "bg-light text-black";
        }
      },
      getQuestion() {
        fetch(
          `http://${this.server_adress}/api/games/${this.game_id}/question/`,
          {
            method: "get",
          }
        )
          .then((res) => {
            return res.json();
          })
          .catch((err) => console.log(err))
          .then((data) => {
            this.answers = data.answers;
            this.answers.forEach((x) => {
              x.position = this.positions[this.answers.indexOf(x)];
              x.title = this.position_titles[this.answers.indexOf(x)];
              x.answer = this.decodeHTML(x.answer);
            });
            this.question = this.decodeHTML(data.question);
            this.category = data.category;
          })
          .catch((err) => console.log(err));
      },
      showToaster(variant, title, answer_id) {
        this.$bvToast.toast(`${this.answers[answer_id].answer}`, {
          title: title,
          variant: variant,
          toaster: "b-toaster-top-center",
          noCloseButton: true,
        });
      },
      connectWS() {
        console.log("Starting connection to WebSocket Server");
        this.ws_server = new WebSocket(`ws://${this.server_adress}/ws`);

        this.ws_server.onopen = () => {
          this.ws_server.send("CLIENT_CONNECT");
          console.log("Successfully connected to the websocket server...");
        };

        this.ws_server.onmessage = (event) => {
          if (event.data.startsWith("TO_CLIENT")) {
            let action = event.data.split(".")[1];
            let thingy = event.data.split(".")[2];

            console.log(`${action} from ${thingy}`);

            switch (action) {
              case "FLIP_A":
                this.selected_answer = 0;
                break;
              case "FLIP_B":
                this.selected_answer = 1;
                break;
              case "FLIP_C":
                this.selected_answer = 2;
                break;
              case "BUTTON":
                if (this.selected_answer != -1) {
                  this.answerQuestion(this.selected_answer);
                }
                break;
            }
          }
        };
      },
      decodeHTML(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
      },
      answerQuestion(answer_id) {
        fetch(
          `http://${this.server_adress}/api/games/${this.game_id}/question/`,
          {
            method: "post",
            body: JSON.stringify({
              answer_id: answer_id,
            }),
          }
        )
          .then((res) => {
            return res.json();
          })
          .catch((err) => console.log(err))
          .then((data) => {
            if (data.correct) {
              this.showToaster("success", "Correct answer", answer_id);
              this.getQuestion();
              this.false_answers.splice(0, this.false_answers.length);
            } else {
              this.showToaster("danger", "Wrong answer", answer_id);
              this.false_answers.push(answer_id);
            }
          })
          .catch((err) => console.log(err));
      },
    },
    mounted() {
      this.connectWS();
      window.addEventListener("unload", () => {
        this.ws_server.send("close");
        this.ws_server.close();
      });
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.selected_answer img {
  filter: invert(1);
}

.selected_wrong_answer img {
  filter: invert(13%) sepia(83%) saturate(7496%) hue-rotate(1deg) brightness(93%) contrast(120%);
}

.fluid-container.footer {
  position: absolute;
  bottom: 0px;
  right: 10px;
}
</style>
