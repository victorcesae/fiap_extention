var currentTab = null;

current_tab();

function current_tab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentTab = tabs[0];
  });
}

async function send_payload(tab, payload, isCopy) {
  const progressBar = document.querySelector(
    `#${isCopy ? "extension-copypast" : "extension-videolist"} .progress-bar`
  );
  const containerProgressBar = document.querySelector(
    `#${
      isCopy ? "extension-copypast" : "extension-videolist"
    } .container-progress-bar`
  );
  const toggleContainerHidden = (active) => {
    if (containerProgressBar)
      containerProgressBar.classList[active ? "remove" : "add"]("hidden");
  };
  const { showIndicators } = await chrome.storage.local.get("showIndicators");
  if (showIndicators) toggleContainerHidden(true);
  // Example function to update UI based on stored progress
  function updateUI(progress) {
    if (progressBar) {
      progressBar.style.width = progress + "%";
      progressBar.textContent = Math.round(progress) + "%";
    }
  }

  // Listen for changes in storage
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (
      namespace === "local" &&
      (changes.progressCopy || changes.progressVideos)
    ) {
      const progressCopy = changes.progressCopy
        ? changes.progressCopy.newValue
        : 0;
      const progressVideos = changes.progressVideos
        ? changes.progressVideos.newValue
        : 0;
      updateUI(isCopy ? progressCopy : progressVideos);
      if (isCopy ? progressCopy : progressVideos == 100) {
        chrome.storage.local.set(
          {
            progressCopy: isCopy ? 0 : progressCopy,
            progressVideos: isCopy ? progressVideos : 0,
          },
          () => {}
        );
        toggleContainerHidden(false);
      }
    }
  });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: payload,
  });
}

document.querySelector("#showIndicators").onchange = (e) => {
  const checked = e.target.checked;
  chrome.storage.local.set({ showIndicators: checked }, () => {});
};
document.addEventListener("DOMContentLoaded", async () => {
  const { showIndicators } = await chrome.storage.local.get("showIndicators");
  const showIndicatorsInput = document.querySelector("#showIndicators");
  if (showIndicatorsInput) showIndicatorsInput.checked = showIndicators;
});

document.querySelector("#extension-copypast").onclick = () => {
  send_payload(currentTab, extension_copypast, true);
};

document.querySelector("#extension-videolist").onclick = () => {
  send_payload(currentTab, extension_videolist, false);
};

const extension_copypast = () => {
  function desbloqueia(dom) {
    if (!dom) return;

    try {
      let questions = dom.querySelectorAll(".on-fast-test-question-container");

      Array.from(questions).map((alternativa) => {
        alternativa.style =
          "-webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; user-select: all;";
      });

      if (dom.body.removeAllListeners) {
        dom.body.removeAllListeners();
      }

      function handleCopyEvent() {
        const selectedText = window.getSelection().toString();

        // Use navigator.clipboard.writeText instead of copyTextArea
        navigator.clipboard
          .writeText(selectedText)
          .then(() => {
            console.log("Text copied to clipboard!");
          })
          .catch((error) => {
            console.error("Error copying text:", error);
          });
      }

      dom.addEventListener("copy", handleCopyEvent);

      questions = dom.querySelectorAll(".on-fast-test-item");

      Array.from(questions).map((question) => {
        texto = question.querySelector(".on-fast-test-question-text");

        texto.onclick = () => {
          navigator.clipboard.writeText(question.innerText);
          alert("Copiado para a área de transferência!");
        };
      });
    } catch (error) {
      console.log(error);
    }
  }

  desbloqueia(document);

  let iframes = document.querySelectorAll("iframe");
  const iframesArray = Array.from(iframes);
  const totalItems = iframesArray.length;
  iframesArray.map((iframe, index) => {
    desbloqueia(iframe.contentDocument);
    chrome.runtime.sendMessage({
      type: "updateProgressCopy",
      progress: ((index + 1) / totalItems) * 100,
    });
  });
  if (totalItems === 0) {
    chrome.runtime.sendMessage({
      type: "updateProgressCopy",
      progress: ((index + 1) / totalItems) * 100,
    });
  }
};

const extension_videolist = async () => {
  var id_curso = location.search?.split("c=")?.[1]?.split("&")?.[0];
  var cm = location.search?.split("id=")?.[1]?.split("&")?.[0];
  let videos = document.querySelectorAll(".conteudo-video-list-item");
  const videosArray = Array.from(videos);
  const totalItems = !id_curso || !cm ? 0 : videosArray.length;
  for (let index = 0; index < totalItems; index++) {
    const video = videosArray[index];
    cm = video.getAttribute("data-cm");
    duration_seconds = video.getAttribute("data-durationseconds");
    id = video.getAttribute("data-id");
    await fetch("https://on.fiap.com.br/local/conteudosvideo/ajax/pause.php", {
      headers: {
        accept: "*/*",
        "accept-language":
          "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "x-requested-with": "XMLHttpRequest",
      },
      referrer: `https://on.fiap.com.br/local/salavirtual/conteudo-video.php?c=${id_curso}&id=${cm}`,
      body: `cm=${cm}`,
      method: "POST",
    });
    await fetch(
      "https://on.fiap.com.br/local/conteudosvideo/ajax/visualizacao.php",
      {
        headers: {
          accept: "*/*",
          "accept-language":
            "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        referrer: `https://on.fiap.com.br/local/salavirtual/conteudo-video.php?c=${id_curso}&id=${cm}`,
        body: `cm=${cm}&linkid=${id}&n=true&t=${duration_seconds}`,
        method: "POST",
      }
    );
    chrome.runtime.sendMessage({
      type: "updateProgress",
      progress: ((index + 1) / totalItems) * 100,
    });
  }
  if (totalItems === 0)
    chrome.runtime.sendMessage({
      type: "updateProgress",
      progress: 100,
    });
};
