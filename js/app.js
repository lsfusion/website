$(document).ready(function() {
//home page text switcher
    setInterval(textSwitcher, 5000);
    function textSwitcher() {
        $("*[data-textswitcher]").each(function(){

            let elem = $(this);
            elem.fadeOut(function () {
                let oldHTML = elem.html();
                elem.html( elem.attr("data-textswitcher") );
                elem.attr("data-textswitcher", oldHTML)
                elem.fadeIn();
            });
        })
    }
//end home page text switcher



    $(document).click(function(e){

        let target = e.target;

        if( $(target).is(".language") || $(target).closest(".language").size() > 0 ){
            $("div.language").toggleClass("active");
        }else{
            $("div.language").removeClass("active");
        }
    })
    $(".menu-link").click(function(e){$(this).toggleClass("active");e.preventDefault()})

    $("body").on("click", ".dropdown", function(e){
        $(this).toggleClass("active");
        e.stopPropagation();
    })
    $(document).click(function(){
        $(".dropdown").removeClass("active");
    });
    $(".dropdown ul li").click(function(){
        $(this).closest(".dropdown").find("li.active").removeClass("active")
        $(this).addClass("active");
        let text = $(this).text();
        $(this).closest(".dropdown").find("em").text( text )

        let _id = $(this).closest(".dropdown").attr("data-apply-to")
        $("#" + _id).attr("class", _id + " " + text.replace(/ /, ""))
    })
//try page
    $("body").on("click", ".dd", function(e){
        if( $(this).hasClass("active")){
            $(this).toggleClass("active");
        }else{
            $(this).toggleClass("active");
            e.stopPropagation();
        }
    })
    $(document).click(function(){
        $(".dd").removeClass("active");
    });
    $(document).on("click", ".dd ul li", function(){

        $(this).closest(".dd").find("li.active").removeClass("active")
        $(this).addClass("active");
        let text = $(this).text();
        $(this).closest(".dd").find("em").text( text )

        $(this).closest(".tryfeature").find(".code").val( $(this).attr("data-value") )
    })

    $("textarea.code").focus(function(){
        $(this).removeClass("loading");
        $(this).closest(".tryfeature").find(".start").removeClass("disabled");
    })
    let server = 'https://tryonline.lsfusion.org';
    if( $("textarea.code").size() > 0) {
        for (let t = 0; t < 2; t++) {
            let currentTab = $(".tryfeature").eq( t );
            $.ajax(server + "/exec?action=Main.getExamples", {
                    data: btoa(unescape(encodeURIComponent(JSON.stringify({'mode': t, 'locale': 'en'})))),
                    contentType: "text/plain",
                    method: "POST",

                    success: function (response) {
                        let list = currentTab.find(".dd ul");

                        for (i in response) {
                            let listItem = $("<li></li>").attr("tab", i).attr("data-value", response[i].text).text( response[i].caption );
                            list.append(listItem)

                            if (i == 0) {//TODO:
                                currentTab.find(".dd em").text( listItem.text() );
                                currentTab.find(".code").removeClass("loading").val( listItem.attr("data-value") )
                                currentTab.find(".results").removeClass("loading");
                                currentTab.find(".start").removeClass("disabled")
                            }
                        }
                    }
                }
            );
        }
    }
    $(".start").click(function(){
        if( $(this).closest(".database").size() > 0 ){
            $(this).closest(".tryfeature").find(".results").text("").addClass("loading")

            $(this).closest(".tryfeature").find(".code").val()

            $.ajax("https://demo.lsfusion.org/mm/eval", {
                    data: $(this).closest(".tryfeature").find(".code").val(),
                    contentType: "text/plain",
                    method: "POST",

                    success: function (response) {

                        $(".database .results").text( response ).removeClass("loading")
                    }
                }
            );

            return;
        }
        //it is platform
        start_server = true;
        $(this).closest(".buttons").find(".stop").removeClass("disabled");

        startServer()

    })
    $(".stop").click(function(){
        $(this).addClass("disabled")
        stopServer();
    })



    function sendEscapedRequest(url, request) {
        return sendRequest(url, btoa(unescape(encodeURIComponent(JSON.stringify(request)))));
    }

    function stopServer(){
        let xhr = sendEscapedRequest(server + "/exec?action=Main.stopServer", {'server': window.serverStartReturn});

        stopLogServerScheduler();
        //getResultArea().value = '';

        start_server = false;
        //rmiStarted = false;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                return this.responseText;
            }
        });
    }
    function startServer(){
        window.lastServerReturn = 0;

        let xhr = sendEscapedRequest(server + "/exec?action=Main.startServer", {'code': $(".platform .code").val()});

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                let response = JSON.parse(this.responseText);
                rmiPort = response.port;
                window.serverStartReturn = response.server;

                $(".open").removeClass("disabled").attr("href", "https://tryonline.lsfusion.org/?port=" + response.port)

                startLogServerScheduler();
                return this.responseText;
            }
        });

    }
    function startLogServerScheduler() {

        if(window.getServerLogScheduler == null) {
            window.getServerLogScheduler = window.setInterval(function () {
                if(!window.isRunning) {
                    getServerLog();
                }
            }, 1000);
        }
    }

    function getServerLog() {
        window.isRunning = true;

        let xhr = sendEscapedRequest(server + "/exec?action=Main.getServerLog", {'server': window.serverStartReturn, 'lastAnswer': window.lastServerReturn});

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                let oldTextareaValue = $(".platform .results").text();
                let response = JSON.parse(this.responseText);

                if(response != null && response.text != null) {
                    $(".platform .results").append(response.text)
                    return;


                    resultArea.value = oldTextareaValue + response.text;

                    if(!rmiStarted) {
                        let match = /.*Exporting\sRMI\sLogics\sobject\s\(port:\s(\d+)\).*/g.exec(resultArea.value);
                        if (match) {
                            window.open(server + '/?port=' + rmiPort, '_blank');
                            showOpenTabButton();
                            rmiStarted = true;
                        }
                    }

                    resultArea.scrollTop = resultArea.scrollHeight;
                    window.lastServerReturn = response.answer;
                } else if (window.start_server && oldTextareaValue === '') {
                    resultArea.value = 'Server is starting...\n';
                }
            }
            window.isRunning = false;
        });
    }

    function stopLogServerScheduler() {
        //выключаем получение логов
        window.clearInterval(window.getServerLogScheduler);
        window.getServerLogScheduler = null;
    }



    let start_server = false;
    window.onbeforeunload = function() {
        if (window.start_server) {

            stopServer();
            window.start_server = false;

            stopLogServerScheduler();
            return "Are you sure?";
        }
    };

})