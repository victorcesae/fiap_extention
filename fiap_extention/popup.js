var currentTab = null;

current_tab()

function current_tab() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        currentTab = tabs[0];
    });
}

function send_payload(tab, payload) {

    chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: payload
    });

}

document.querySelector("#hack-copypast").onclick = () => {
    send_payload(currentTab, hack_copypast)
}

document.querySelector("#hack-videolist").onclick = () => {
    send_payload(currentTab, hack_videolist)
}

const hack_copypast = () => {

    function desbloqueia(dom) {

        if (!dom) return

        try {

            let questions = dom.querySelectorAll(".on-fast-test-question-container")

            Array.from(questions).map(alternativa => {

                alternativa.style = "-webkit-user-select: all; -moz-user-select: all; -ms-user-select: all; user-select: all;"
                
            })

            if (dom.body.removeAllListeners) {
                dom.body.removeAllListeners()
            }

            questions = dom.querySelectorAll(".on-fast-test-item")

            Array.from(questions).map(question => {

                texto = question.querySelector(".on-fast-test-question-text")

                texto.onclick = () => {
                    navigator.clipboard.writeText(question.innerText)
                    alert("Copiado para a área de transferência!")
                }
                
            })

        } catch (error) {
            console.log(error)
        }

    }

    desbloqueia(document)

    let iframes = document.querySelectorAll("iframe")
    if (iframes.length > 0) {
        Array.from(iframes).map(iframe => {
            desbloqueia(iframe.contentDocument)
        })
    }

}

const hack_videolist = () => {

    var id_curso = location.search.split('c=')[1].split('&')[0]
    var cm = location.search.split('id=')[1].split('&')[0]

    let videos = document.querySelectorAll(".conteudo-video-list-item")

    Array.from(videos).map(video => {

        cm = video.getAttribute("data-cm")
        duration_seconds = video.getAttribute("data-durationseconds")
        id = video.getAttribute("data-id")

        fetch("https://on.fiap.com.br/local/conteudosvideo/ajax/pause.php", {
        "headers": {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": `https://on.fiap.com.br/local/salavirtual/conteudo-video.php?c=${id_curso}&id=${cm}`,
        "body": `cm=${cm}`,
        "method": "POST",
        });

        fetch("https://on.fiap.com.br/local/conteudosvideo/ajax/visualizacao.php", {
        "headers": {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": `https://on.fiap.com.br/local/salavirtual/conteudo-video.php?c=${id_curso}&id=${cm}`,
        "body": `cm=${cm}&linkid=${id}&n=true&t=${duration_seconds}`,
        "method": "POST",
        });
        
    })

}