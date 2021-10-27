$(document).ready(function() {

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
        $("#" + _id).attr("class", _id + " " + text)
    })

})