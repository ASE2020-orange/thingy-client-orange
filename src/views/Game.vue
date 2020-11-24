<template>
<div class="Game">
  <b-container fluid id="settingsContainer" v-if="showSettings">
    <b-row class="vh-30 text-center" align-v="center">
      <b-col sm="3">
          <label for="categorySelection">Quizz questions categories </label>
      </b-col>
      <b-col sm="6">
        <select v-model ="selectedCategory" class="form-control form-control-sm" name="categorySelection" id="quizzCategoriesSelection">
          <option v-for="category in categories" v-bind:value="{id: category.id, name: category.name}" :key="category.id">
            {{category.name}}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row class="vh-30 text-center" align-v="center">
      <b-col sm="3">
          <label for="difficultySelection">Questions difficulty</label>
      </b-col>
      <b-col sm="6">
        <select class="form-control form-control-sm" v-model="selectedDifficulty" name="difficultySelection" id="quizzDifficultySelection">
          <option v-for="difficulty in difficulties" v-bind:value="{difficulty: difficulty}" :key="difficulty">
            {{difficulty}}
          </option>
        </select>
      </b-col>
    </b-row>
    <b-row class="vw-100 text-center" align-v="center">
      <button type="button" class="btn btn-primary" v-on:click="startGame()">Start game</button>
    </b-row>
  </b-container>
  
  
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
    this.getCategories();
    //this.startGame();
  },
    data: () => {
      return {
        server_adress: "localhost:1080/api",
        ws_server: undefined,
        showSettings: true,

        categories : [],
        selectedCategory: {},

        difficulties : [
          'easy',
          'medium',
          'hard',
        ],
        selectedDifficulty: {difficulty:'easy'},


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
      startGame() {
        this.showSettings = false;

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: this.selectedCategory.id, difficulty: this.selectedDifficulty.difficulty }),
        };

        fetch(`http://${this.server_adress}/games/`, requestOptions)
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

      getCategories()
      {
          fetch(`http://${this.server_adress}/categories/`, {
              method: "get",
          })
          .then((res) => {
            return res.json();
          })
          .catch((err) => console.log(err))
          .then((data) => {
            this.categories = data.trivia_categories;
            this.selectedCategory = this.categories[0];
          })
          .catch((err) => console.log(err));
      },

      getQuestion() {
        fetch(
          `http://${this.server_adress}/games/${this.game_id}/question/`,
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
          `http://${this.server_adress}/games/${this.game_id}/question/`,
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
