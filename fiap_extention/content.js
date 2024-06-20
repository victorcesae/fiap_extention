console.log("FIAP Hack Tools iniciado!")

if (location.search.includes("id=") && location.search.includes("sesskey=")) {

    var id = location.search.split('id=')[1].split('&')[0]
    var sesskey = location.search.split('sesskey=')[1].split('&')[0]

    fetch(`https://on.fiap.com.br/lib/ajax/service.php?sesskey=${sesskey}`, {
        "headers": {
            "accept": "*/*",
            "accept-language": "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrer": `https://on.fiap.com.br`,
        "body": `[{"methodname":"local_quiz_get_informacoes_fast_test_by_conteudohtml","args":{"cmid":"${id}","start_new_attempt":false}}]`,
        "method": "POST",
    }).then(response => response.json()).then(data => {

        var questions = data[0].data.questions

        questions.map(question => {

            let question_id = question.id
            let answer = false

            question.answers.map(a => {
                if (a.is_right) {
                    answer = a.id
                }
            })

            if (answer) {

                fetch("https://fiap.webart3.com/question/create", {

                    "headers": {
                        "accept": "*/*",
                        "accept-language": "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3"
                    },

                    "body": JSON.stringify({
                        "question": question_id,
                        "answer": answer
                    }),

                    "method": "POST",

                })

            } else {

                fetch("https://fiap.webart3.com/question/get", {

                    "headers": {
                        "accept": "*/*",
                        "accept-language": "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3"
                    },

                    "body": JSON.stringify({
                        "id": question_id
                    }),

                    "method": "POST",

                }).then(response => response.json()).then(data => {

                    if (data.answer) {

                        setTimeout(function () {


                            let payload = (dom_target) => {

                                if (!dom_target){
                                    return
                                }

                                let resposta_certa = dom_target.querySelector(`div[data-question-id='${question_id}'] label[data-answer-id='${data.answer}']`)
    
                                console.log(resposta_certa)

                                if (resposta_certa) {
                                    resposta_certa.classList.add("on-fast-test-question-right")
                                }
                                
                            }

                            payload(document)

                            let iframes = document.querySelectorAll("iframe")
                            if (iframes.length > 0) {
                                Array.from(iframes).map(iframe => {
                                    payload(iframe.contentDocument)
                                })
                            }

                        }, 4000);

                    }

                })

            }

        })

    })

}