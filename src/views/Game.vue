<template>
  <div class="Game">
    <div v-if="thingy_id == -1">
      You need to synchronize your Thingy in order to play the Game !
      <br />Different players should try to position their Thingy in different
      positions to distinguish them
      <b-list-group horizontal class="justify-content-center">
        <ThingySync
          v-bind:key="index"
          v-bind:thingy="thingy"
          v-for="(thingy, index) in thingys"
        ></ThingySync>
      </b-list-group>
    </div>
    <div v-if="thingy_id != -1">
      <h2 class="mt-2" v-if="showSettings">Select the game settings</h2>
      <b-container
        class="offset-sm-3"
        fluid
        id="settingsContainer"
        v-if="showSettings"
      >
        <b-row class="vh-30 text-center mt-4" align-v="center">
          <b-col class="text-left" sm="3">
            <label for="categorySelection">Quizz questions categories </label>
          </b-col>
          <b-col sm="3">
            <select
              v-model="selectedCategory"
              class="form-control form-control-sm"
              name="categorySelection"
              id="quizzCategoriesSelection"
            >
              <option
                v-for="category in categories"
                v-bind:value="{ id: category.id, name: category.name }"
                :key="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </b-col>
        </b-row>
        <b-row class="vh-30 text-left mt-2" align-v="center">
          <b-col sm="3">
            <label for="difficultySelection">Questions difficulty</label>
          </b-col>
          <b-col sm="3">
            <select
              class="form-control form-control-sm"
              v-model="selectedDifficulty"
              name="difficultySelection"
              id="quizzDifficultySelection"
            >
              <option
                v-for="difficulty in difficulties"
                v-bind:value="{ difficulty: difficulty }"
                :key="difficulty"
              >
                {{ difficulty }}
              </option>
            </select>
          </b-col>
        </b-row>
        <b-row class="vw-100 text-left mt-2">
          <b-col sm="6">
            <button
              type="button"
              class="btn btn-primary"
              v-on:click="startGame()"
            >
              Start game
            </button>
          </b-col>
        </b-row>
      </b-container>

      <b-container fluid v-if="!showSettings">
        <b-row class="vh-100 text-center" align-v="center">
          <b-col sm="8">
            <category v-bind:category="category"></category>
            <question v-bind:question="question"></question>
            <b-list-group horizontal class="justify-content-center">
              <answer
                v-bind:key="answer.id"
                v-bind:class="isAnswerSelectedClass(index)"
                v-bind:answer="answer"
                v-for="(answer, index) in answers"
              ></answer>
            </b-list-group>
          </b-col>
          <b-col sm="4">
            <base-timer @timerUp="handleTimerUp" timeLimit="10" ref="questionTimer"></base-timer>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </div>
</template>

<script>
import Category from "@/components/Category.vue";
import Question from "@/components/Question.vue";
import Answer from "@/components/Answer.vue";
import ThingySync from "@/components/ThingySync.vue";
import BaseTimer from "@/components/BaseTimer.vue";

export default {
  name: "Game",
  components: {
    Category,
    Question,
    Answer,
    ThingySync,
    BaseTimer,
  },
  data: () => {
    return {
      ws_server: undefined,
      showSettings: true,

      categories: [],
      selectedCategory: {},

      difficulties: ["Easy", "Medium", "Hard"],
      selectedDifficulty: { difficulty: "Easy" },

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
      thingy_id: -1,
      thingys: new Array(),
    };
  },
  methods: {
    startGame() {
      this.showSettings = false;

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: this.selectedCategory.id,
          difficulty: this.selectedDifficulty.difficulty.toLowerCase(),
        }),
      };

      fetch(
        `${this.http_prefix}${this.server_adress}/api/games/`,
        requestOptions
      )
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

    getCategories() {
      fetch(`${this.http_prefix}${this.server_adress}/api/categories/`, {
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
    checkExistingGame() {
      fetch(`${this.http_prefix}${this.server_adress}/api/games/`, {
        method: "get",
      })
        .then((res) => {
          return res.json();
        })
        .catch((err) => console.log(err))
        .then((data) => {
          this.game_id = data.game_id;
          if (this.game_id != -1) {
            this.showSettings = false;
            if (this.thingy_id != -1) {
              this.getQuestion();
            }
          }
        })
        .catch((err) => console.log(err));
    },
    getQuestion() {
      this.resetFalseAnswersOnGUI();
      this.showToaster("info", "Next question", "Getting next question");
      fetch(
        `${this.http_prefix}${this.server_adress}/api/games/${this.game_id}/question/`,
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
          this.$refs.questionTimer.reset();
        })
        .catch((err) => console.log(err));
    },
    showToaster(variant, title, content) {
      this.$bvToast.toast(content, {
        title: title,
        variant: variant,
        toaster: "b-toaster-top-center",
        noCloseButton: true,
      });
    },
    connectWS() {
      console.log("Starting connection to WebSocket Server");
      this.ws_server = new WebSocket(
        `${this.ws_prefix}${this.server_adress}/ws`
      );

      this.ws_server.onopen = () => {
        this.ws_server.send("CLIENT_CONNECT");
        console.log("Successfully connected to the websocket server...");
      };

      this.ws_server.onmessage = (event) => {
        if (event.data.startsWith("TO_CLIENT")) {
          let action = event.data.split(".")[1];
          let thingy = event.data.split(".")[2];
          let thingy_id = -1;
          if (thingy != null) {
            thingy_id = thingy.split("-")[1];
          }

          switch (action) {
            case "FLIP_A":
              if (this.thingy_id == thingy_id || this.thingy_id == -1) {
                this.selected_answer = 0;
              }
              break;
            case "FLIP_B":
              if (this.thingy_id == thingy_id || this.thingy_id == -1) {
                this.selected_answer = 1;
              }

              break;
            case "FLIP_C":
              if (this.thingy_id == thingy_id || this.thingy_id == -1) {
                this.selected_answer = 2;
              }
              break;
            case "BUTTON":
              if (
                this.thingy_id == thingy_id &&
                this.selected_answer != -1 &&
                this.game_id != -1
              ) {
                this.answerQuestion(this.selected_answer);
              }
              break;
            case "GAME_FINISHED":
              this.finishGame();
              break;
            case "NEXT_QUESTION":
              this.getQuestion();
              break;
            case "GAME_STARTED":
              if (this.thingy_id != -1) {
                this.checkExistingGame();
              } else {
                this.showToaster(
                  "info",
                  "Game started",
                  "A game has been started, hurry up to choose your Thingy!"
                );
              }
              break;
          }

          if (this.thingy_id == -1) {
            for (let i = 0; i < 3; i++) {
              this.$set(
                this.thingys[thingy_id - 1].positions_selected,
                i,
                i == this.selected_answer ? true : false
              );
            }
          }
        }
      };
    },
    handleTimerUp()
    {
      this.showToaster("danger", "Time over", "You were too slow to answer !");
      this.getQuestion();
    },
    finishGame() {
      this.game_id = -1;
      this.showSettings = true;
      this.showToaster(
        "info",
        "Game finished",
        "All the questions were answered"
      );
    },
    decodeHTML(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
      return txt.value;
    },
    resetFalseAnswersOnGUI() {
      this.false_answers.splice(0, this.false_answers.length);
    },
    answerQuestion(answer_id) {
      fetch(
        `${this.http_prefix}${this.server_adress}/api/games/${this.game_id}/question/`,
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
            this.showToaster(
              "success",
              "Correct answer",
              this.answers[answer_id].answer
            );
          } else {
            this.showToaster(
              "danger",
              "Wrong answer",
              this.answers[answer_id].answer
            );
            this.false_answers.push(answer_id);
          }
        })
        .catch((err) => console.log(err));
    },
    selectThingy(thingy_id) {
      this.thingy_id = thingy_id;
      this.checkExistingGame();
    },
  },
  mounted() {
    this.getCategories();
    this.connectWS();
    this.checkExistingGame();
    if (this.thingy_id == -1) {
      for (let i = 1; i < 4; i++) {
        this.thingys.push({
          positions: this.positions,
          id: i,
          positions_selected: [false, false, false],
        });
      }
    }
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
  filter: invert(13%) sepia(83%) saturate(7496%) hue-rotate(1deg)
    brightness(93%) contrast(120%);
}

.fluid-container.footer {
  position: absolute;
  bottom: 0px;
  right: 10px;
}
</style>
