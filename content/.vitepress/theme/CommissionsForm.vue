<template>
  <p class="center">
    <button @click="toggleCommissionsPopup" id="request-button">
      🚀 Request An Commissions
    </button>
  </p>
  <Transition>
    <template v-if="showPopup">
      <div id="popup">
        <div id="overlay" @click="toggleCommissionsPopup">
          <div id="content" @click.stop>
            <a id="close" @click="toggleCommissionsPopup">×</a>
            <div id="main-content">
              <h4>Request An Commissions</h4>
              <p>Please fill out the form below to request an commissions.</p>
              <form ref="myForm" @submit.prevent="sendForm">
                <div class="form-group">
                  <label for="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    v-model="name"
                    placeholder="John Doe"
                  />
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    required
                    v-model="email"
                    placeholder="example@example.com"
                  />
                </div>
                <div class="form-group ohnohoney">
                  <label for="honeypot">Honeyvotepot</label>
                  <input
                    type="text"
                    id="honeypot"
                    v-model="honeypot"
                    placeholder="Email"
                  />
                </div>
                <div class="form-group">
                  <label for="projectType">Project Type</label>
                  <div class="select-buttons" id="project-type">
                    <button
                      type="button"
                      @click="projectType = 'Web Development'"
                      :class="{ active: projectType === 'Web Development' }"
                    >
                      Web Development
                    </button>
                    <button
                      type="button"
                      @click="projectType = 'Web Design'"
                      :class="{ active: projectType === 'Web Design' }"
                    >
                      Web Design
                    </button>
                    <button
                      type="button"
                      @click="projectType = 'Both'"
                      :class="{ active: projectType === 'Both' }"
                    >
                      Both
                    </button>
                  </div>
                  <input type="hidden" v-model="projectType" required />
                </div>
                <div
                  v-if="
                    projectType === 'Web Development' || projectType === 'Both'
                  "
                  class="form-group"
                >
                  <label for="frontend">Frontend Type</label>
                  <div class="select-buttons">
                    <button
                      type="button"
                      @click="frontend = 'Aplós'"
                      :class="{ active: frontend === 'Aplós' }"
                    >
                      Aplós
                    </button>
                    <button
                      type="button"
                      @click="frontend = 'Aplóe'"
                      :class="{ active: frontend === 'Aplóe' }"
                    >
                      Aplóe
                    </button>
                    <button
                      type="button"
                      @click="frontend = 'Custom'"
                      :class="{ active: frontend === 'Custom' }"
                    >
                      Custom
                    </button>
                  </div>
                  <input type="hidden" v-model="frontend" required />
                </div>
                <div class="form-group">
                  <label for="scale">Scale</label>
                  <div class="select-buttons">
                    <button
                      type="button"
                      @click="scale = 'Small'"
                      :class="{ active: scale === 'Small' }"
                    >
                      Small
                    </button>
                    <button
                      type="button"
                      @click="scale = 'Medium'"
                      :class="{ active: scale === 'Medium' }"
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      @click="scale = 'Large'"
                      :class="{ active: scale === 'Large' }"
                    >
                      Large
                    </button>
                  </div>
                  <input type="hidden" v-model="scale" required />
                </div>
                <div class="form-group">
                  <label for="details">Details</label>
                  <textarea
                    id="details"
                    required
                    v-model="details"
                    placeholder="Details of the project, additional services, etc. Provide as much detail as possible, so I can provide an accurate quote."
                  ></textarea>
                </div>
                <div v-if="errorMessage" class="error-message">
                  {{ errorMessage }}
                </div>
                <button type="submit">{{ submitButtonText }}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Transition>
</template>

<style lang="scss">
#popup {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  z-index: 9999999;
  width: 100%;
  height: 100%;

  #overlay {
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(0.525rem);
    transition: backdrop-filter 300ms;
    background-color: rgba(140, 149, 159, 0.2);
    width: 100%;
    height: 100%;

    @media (prefers-color-scheme: dark) {
      background-color: rgba(0, 0, 0, 0.496);
    }
  }

  #content {
    position: relative;
    box-shadow: var(--base-shadow);
    border-radius: 0.625rem;
    background-color: var(--color-background);
    padding: 2.3rem 1.8rem;
    width: 90%;
    max-width: 500px;
    height: max-content;
    max-height: 100%;
    overflow-y: auto;

    @media (min-width: 768px) {
      width: 30%;
    }

    #main-content {
      display: flex;
      flex-direction: column;
      justify-content: start;
      align-items: start;
      gap: 0.7rem;
      width: 100%;
      height: max-content;

      h4 {
        margin: 0 !important;
        line-height: 1.7rem;
      }

      p {
        font-weight: 500;
        font-size: 1rem;
        margin: 0 !important;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
        width: 100%;
        height: max-content;

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          width: 100%;

          label {
            font-weight: 600;
            font-size: 1rem;
          }

          input {
            padding: 0.8rem;
            border: 0;
            background-color: var(--color-background-second);
            border-radius: 0.8rem;
            font-size: 1rem;
          }

          textarea {
            padding: 0.8rem;
            border: 0;
            background-color: var(--color-background-second);
            border-radius: 0.8rem;
            font-size: 1rem;
            resize: vertical;
            min-height: 90px;
          }

          .select-buttons {
            display: flex;
            gap: 0.5rem;
            flex-direction: row;
            width: 100%;

            @media screen and (max-width: 768px) {
              flex-direction: column;
            }

            &#project-type {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              grid-template-rows: auto auto;
              grid-template-areas:
                "button1 button2"
                "button3 button3";
              button:nth-child(1) {
                grid-area: button1;
              }
              button:nth-child(2) {
                grid-area: button2;
              }
              button:nth-child(3) {
                grid-area: button3;
              }

              @media screen and (max-width: 768px) {
                grid-template-columns: repeat(1, 1fr);
                grid-template-areas:
                  "button1"
                  "button2"
                  "button3";
              }
            }

            button {
              width: 100%;

              &.active {
                background-color: var(--color-accent);
                color: var(--color-background);
              }
            }
          }

          select {
            padding: 0.8rem;
            border: 0;
            background-color: var(--color-background-second);
            color: var(--color-text-secondary);
            border-radius: 0.8rem;
            font-size: 1rem;
          }
        }

        button {
          padding: 0.8rem;
          margin-top: 0.2rem;
          border: none;
          font-weight: 600;
          border-radius: 0.8rem;
          background-color: var(--color-background-second);
          font-size: 1rem;
          cursor: pointer;

          &:hover {
            opacity: 0.8;
          }

          &[type="submit"] {
            background-color: var(--color-background-mute);
          }
        }
      }
    }

    #close {
      position: absolute;
      top: 0.2rem;
      right: 1rem;
      cursor: pointer;
      font-weight: 400;
      text-decoration: none;
      padding: 0.625rem;
      color: var(--color-text);
      font-size: 1.5rem;

      &:hover {
        opacity: 0.8;
      }
    }
  }
}

.center {
  text-align: center;
}

#request-button {
  padding: 1rem 2rem;
  border: none;
  font-weight: 600;
  border-radius: 0.8rem;
  background-color: var(--color-background-second);
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
}

.v-enter-active,
.v-leave-active {
  backdrop-filter: blur(0.625rem);
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  backdrop-filter: 0;
}
</style>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";

const showPopup = ref(false);
const name = ref("");
const email = ref("");
const projectType = ref("");
const frontend = ref("");
const scale = ref("");
const details = ref("");
const honeypot = ref("");
const submitButtonText = ref("Submit");
const errorMessage = ref("");

const toggleCommissionsPopup = () => {
  showPopup.value = !showPopup.value;
};

const sendForm = async () => {
  if (
    !name.value ||
    !email.value ||
    !projectType.value ||
    !scale.value ||
    !details.value ||
    honeypot.value
  ) {
    errorMessage.value = "Please fill out all required fields.";
    return;
  }
  errorMessage.value = "";

  try {
    const TOKEN = import.meta.env.VITE_TOKEN;
    const CHAT_ID = "5777053104";
    const URI_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

    const message = `
          <b>Commission Request:</b>
            - <b>Name:</b> ${name.value}
            - <b>Email:</b> ${email.value}
            - <b>Project Type:</b> ${projectType.value}
            - <b>Frontend:</b> ${frontend.value}
            - <b>Scale:</b> ${scale.value}
            - <b>Details:</b> ${details.value}
        `;

    await fetch(URI_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        parse_mode: "html",
        text: message,
      }),
    });

    name.value = "";
    email.value = "";
    projectType.value = "";
    frontend.value = "";
    scale.value = "";
    details.value = "";
    honeypot.value = "";
    submitButtonText.value = "Looking forward to work with you 🚀";
    setTimeout(() => {
      submitButtonText.value = "Submit";
      toggleCommissionsPopup();
    }, 1000);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === "Escape" && showPopup.value) {
    toggleCommissionsPopup();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscKey);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscKey);
});
</script>
