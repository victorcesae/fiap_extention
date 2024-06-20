console.log("FIAP Tools iniciado!");
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function createProgressBar() {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor =
    "rgba(0, 0, 0, 0.5)"; /* Semi-transparent black */
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "1000"; /* Make sure it's on top */

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper-progress-bar";
  wrapper.style.width = "350px";
  wrapper.style.backgroundColor = "#f3f4f6"; /* Light gray */
  wrapper.style.borderRadius = "0.375rem"; /* Rounded corners */
  wrapper.style.overflow = "hidden";
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "0";
  wrapper.style.left = "0";
  wrapper.style.color = "#2563eb";
  wrapper.style.padding = "1rem";
  wrapper.style.fontWeight = "bold";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.textContent = "Analisando perguntas com o FIAP Extention";
  const { showIndicators } = await chrome.storage.local.get("showIndicators");
  if (!showIndicators) wrapper.style.display = "none";
  // Create container
  const container = document.createElement("div");
  container.className = "container-progress-bar";
  container.style.width = "100%";
  container.style.backgroundColor = "#e5e7eb"; /* Light gray */
  container.style.borderRadius = "9999px"; /* Full rounded corners */
  container.style.overflow = "hidden";

  // Create progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.style.width = "0";
  progressBar.style.height = "1rem";
  progressBar.style.backgroundColor = "#2563eb"; /* Blue */
  progressBar.style.textAlign = "center";
  progressBar.style.color = "#dbeafe"; /* Light blue */
  progressBar.style.fontSize = "0.75rem";
  progressBar.style.fontWeight = "500";
  progressBar.style.lineHeight = "1";
  progressBar.style.borderRadius = "9999px"; /* Full rounded corners */
  progressBar.style.transition = "width 0.5s ease"; /* Smooth transition */
  progressBar.textContent = "0%";

  // Append elements
  container.appendChild(progressBar);
  wrapper.appendChild(container);
  //   overlay.appendChild(wrapper);
  document.body.append(wrapper);

  // Return the progress bar element for further updates
  return { wrapper, progressBar };
}

// Function to update the progress bar
function updateProgressBar(progressBar, progress) {
  progressBar.style.width = progress + "%";
  progressBar.textContent = progress + "%";
}

if (location.search.includes("id=") && location.search.includes("sesskey=")) {
  var id = location.search?.split("id=")?.[1]?.split("&")?.[0];
  var sesskey = location.search?.split("sesskey=")?.[1]?.split("&")?.[0];
  if (id && sesskey) {
    const fetchFastTestAnswers = async () => {
      const { wrapper, progressBar } = await createProgressBar();
      await delay(5000);
      await fetch(
        `https://on.fiap.com.br/lib/ajax/service.php?sesskey=${sesskey}`,
        {
          headers: {
            accept: "*/*",
            "accept-language":
              "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: `https://on.fiap.com.br`,
          body: JSON.stringify([
            {
              methodname:
                "local_quiz_get_informacoes_fast_test_by_conteudohtml",
              args: { cmid: id, start_new_attempt: false },
            },
          ]),
          method: "POST",
        }
      )
        .then((response) => response.json())
        .then(async (data) => {
          if (!data[0].data) {
            alert("Caso este documento tenha um fast-test atualize a página!!");
            return;
          }
          var questions = data[0].data.questions;
          const totalItems = questions.length;
          for (let index = 0; index < totalItems; index++) {
            const question = questions[index];
            let question_id = question.id;
            let answer = false;

            question.answers.map((a) => {
              if (a.is_right) {
                answer = a.id;
              }
            });

            if (answer) {
              await fetch("https://fiap.webart3.com/question/create", {
                headers: {
                  accept: "*/*",
                  "accept-language":
                    "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
                },

                body: JSON.stringify({
                  question: question_id,
                  answer: answer,
                }),

                method: "POST",
              });
            } else {
              await fetch("https://fiap.webart3.com/question/get", {
                headers: {
                  accept: "*/*",
                  "accept-language":
                    "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
                },

                body: JSON.stringify({
                  id: question_id,
                }),

                method: "POST",
              })
                .then((response) => response.json())
                .then(async (data) => {
                  if (data.answer) {
                    await delay(4000);
                    let payload = (dom_target) => {
                      if (!dom_target) {
                        return;
                      }

                      let resposta_certa = dom_target.querySelector(
                        `div[data-question-id='${question_id}'] label[data-answer-id='${data.answer}']`
                      );

                      console.log(resposta_certa);

                      if (resposta_certa) {
                        resposta_certa.classList.add(
                          "on-fast-test-question-right"
                        );
                      }
                    };

                    payload(document);

                    let iframes = document.querySelectorAll("iframe");
                    if (iframes.length > 0) {
                      Array.from(iframes).map((iframe) => {
                        payload(iframe.contentDocument);
                      });
                    }
                  }
                });
            }
            const progress = ((index + 1) / totalItems) * 100;
            updateProgressBar(progressBar, Math.round(progress));
          }
          wrapper.remove();
        });
    };
    fetchFastTestAnswers();
  }
}
