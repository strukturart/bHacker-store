"use strict";

let page = 0;
let pos_focus = 0;
let article_array;
let tabindex_i = -0;
let window_status = "article-list";
let dataSet;
let panels = ["All"];
let current_panel = 0;
let app_slug;
let offline = false;
let apps_data = new Array();
let update_time;
let apps_rating = new Array();
let co;
let contributors = new Array();

//////////////////////////////
//fetch-database////
//////////////////////////////
init();

function init() {
    BackendApi.setStatusCallback(toaster);

    function loadData() {
        dataSet = BackendApi.getData();
        addAppList(addAppList_callback);
        document.querySelector("div#message-box").style.animationPlayState =
            "running";
        document.querySelector(
            "div#message-box img.icon-2"
        ).style.animationPlayState = "running";
        document.querySelector(
            "div#message-box img.icon-1"
        ).style.animationPlayState = "running";
        document.querySelector("div#message-box div").style.display = "none";

        DownloadCounter.load().then((_) => {
            const apps = document.querySelector("div#app-panels article");
            for (let i = 0; i < apps.length; i++) {
                const appId = apps[i].getAttribute("data-slug");

                if (appId) {
                    const dl_section = apps[i].querySelector("div.dl-cnt");
                    const count = DownloadCounter.getForApp(appId);

                    if (dl_section && count !== -1) {
                        dl_section.innerHTML = "<span>Downloads </span>" + count;
                    }
                }
            }
        });
    }

    if (!BackendApi.getData()) {
        if (!navigator.onLine) {} else {
            BackendApi.update()
                .then(loadData)
                .catch((error) => {
                    console.log(error);
                    toaster(error instanceof Error ? error.message : error, 3000);
                });
        }
    } else {
        if (navigator.onLine) {
            BackendApi.update()
                .then(loadData)
                .catch((error) => {
                    console.log(error);
                    toaster(error instanceof Error ? error.message : error, 3000);
                    loadData();
                });
        } else {
            offline = true;
            toaster(
                "<br> your device is offline, you can view the app but you cannot install it.",
                3000
            );

            loadData();
        }
    }
}

contributors = ["40min"];

function addAppList(callback) {
    dataSet.apps.forEach(function(value, index) {
        let data = dataSet.apps[index];
        let item_title = data.name;
        let item_summary = data.description;
        let item_link = data.download.url;
        let item_url = data.git_repo;
        let item_donation = data.donation;
        let item_ads = data.has_ads;
        let item_tracking = data.has_tracking;
        let tag = data.meta.categories;
        let item_categorie = data.meta.categories.toString().replace(",", " ");
        let item_tags = tag.toString().replace(",", " ");
        let item_author = data.author.toString();
        let item_icon = data.icon;
        let item_license = data.license;
        let item_type = data.type;
        let images = "";
        let images_collection = "";
        let donation_icon = "none";
        let item_slug = data.slug;
        panels.push(data.meta.categories);

        //unique author list
        let just_author_name = item_author.split("<")[0].trim();
        if (contributors.indexOf(just_author_name) === -1) {
            contributors.push(just_author_name);
        }
        //apps thumbnails
        if (data.screenshots != "") {
            images = data.screenshots.toString();
            images = images.split(",");

            images.forEach(function(value, index) {
                images_collection += "<li><img src=" + images[index] + "></li>";
            });
        } else {
            images_collection = "";
        }

        if (item_donation == "") {
            donation_icon = "no";
        } else {
            donation_icon = "yes";
        }

        if (item_ads) {
            item_ads = "yes";
        } else {
            item_ads = "no";
        }

        if (item_tracking) {
            item_tracking = "yes";
        } else {
            item_tracking = "no";
        }

        //get_ratings(item_slug, ratings_callback);

        //to do
        //push data in array
        //to create elements in dom if needed

        apps_data.push({

            titel: item_title,
            author: item_author,
            summary: item_summary,
            categorie: item_categorie,
            link: item_link,
            license: item_license,
            ads: item_ads,
            donation_url: item_donation,
            donation: donation_icon,
            tracking: item_tracking,
            type: item_type,
            images: [data.screenshots],
            summarie: item_summary,
            icon: item_icon,
            slug: item_slug,
            tags: item_tags,
            url: item_url,
            link: item_link,

        });
    });

    update_time = moment(dataSet.generated_at).format("DD.MM.YYYY, HH:mm");
    co = contributors.sort().join(", ");

    callback("done");
}

function addAppList_callback(data) {
    document.querySelector("#update").textContent = update_time;
    document.querySelector(
        "div#about div#inner div#contributors"
    ).textContent = co;
    document.querySelector("article#search input").focus();

    bottom_bar("", "select", "about");
    renderHello();

    set_tabindex();





}

function set_tabindex() {
    let articles_panel = document.querySelectorAll("article");


    var tabindex = 0;
    for (let i = 0; i < articles_panel.length; i++)
        if (articles_panel[i].type != "hidden") {
            tabindex++;

            articles_panel[i].setAttribute("tabindex", tabindex)

        }

    document.querySelectorAll("article")

    let focusme = document.querySelectorAll('article[tabindex="1"]')
    focusme[0].focus()

}



function renderHello() {
    var template = document.getElementById("template").innerHTML;
    var rendered = Mustache.render(template, { "data": apps_data });
    document.getElementById("apps").innerHTML = rendered;
}

function panels_list(panel) {
    let articles = document.querySelectorAll("article");

    let elements = document.getElementsByClassName(panel);


    articles.forEach(function(value, key) {
        articles[key].style.display = "none";

    });


    for (let i = 0; i < elements.length; i++) {
        elements[i].style.display = "block";
    }
    set_tabindex()

}


////////////////////////
//NAVIGATION
/////////////////////////
///thank you farooqkz
//for the clever solution

function nav_panels(left_right) {
    window.scrollTo(0, 0);
    focused = 0

    if (left_right == "left") {
        current_panel--;
    }

    if (left_right == "right") {
        current_panel++;
    }

    current_panel = current_panel % panels.length;
    if (current_panel < 0) {
        current_panel += panels.length;
    }

    document.querySelector("div#navigation div").textContent =
        panels[current_panel];
    panels_list(panels[current_panel]);

    if (current_panel == 0) {
        document.querySelector("input").focus();
        document.querySelector("div#navigation").style.display = "none";
    } else {
        document.querySelector("div#navigation").style.display = "block";
    }
}



//up - down
let focused = 0

function nav(param) {


    let articles = document.querySelectorAll("article");



    if (param == "+1" && focused < articles.length) {
        focused++;

        articles[focused].focus()


    }

    if (param == "-1" && focused > 0) {
        focused--;

        articles[focused].focus()


    }


}





jQuery(function() {

    searchGetData();






    /*
        //up - down

        function nav(param) {
            let focused = $(":focus").attr("tabindex");
            let siblings = $(":focus").parent().children(":visible");
            let siblingsLength = $(":focus").parent().children(":visible").length;

            if ($("input").is(":focus")) {
                $("article#search").next().focus();
            }

            if (param == "+1" && focused < siblingsLength - 1) {
                focused++;

                var focusedElement = $(":focus")[0].offsetTop;

                $("html, body").animate({ scrollTop: focusedElement }, 200);

                siblings[focused].focus();

                if ($("article#search").is(":focus")) {
                    document.querySelector("input").focus();
                }
            }

            if (param == "-1" && focused > 0) {
                focused--;

                siblings[focused].focus();

                if ($("article#search").is(":focus")) {
                    document.querySelector("input").focus();
                }
            }
        }
    */
    //store current article
    let article_id;

    function show_article(app) {
        apps_data.forEach(function(item, index) {
            console.log(item[1]);
        });
        let $focused;
        if (app) {
            $focused = $('[data-slug="' + app + '"]');
            $('[data-slug="' + app + '"]').focus();
        } else {
            $focused = $(":focus");
        }

        let getClass = $focused.attr("class");
        //let getId = $focused.parent().attr("id");
        article_id = $focused.attr("id");

        if (getClass != "About") {
            $("article").css("display", "none");
            $("div#navigation").css("display", "none");
            $("div#app div#app-panels").css("margin", "5px 0 0 0");
            $("div#app div#app-panels").css("max-height", "100%");
            $focused.css("display", "block");
            $("div.summary").css("display", "block");
            $("div.meta-data").css("display", "block");
            $("div.icon").css("display", "block");
            $("div.channel").css("display", "none");
            $("ul.images").css("display", "block");
            if (!offline) {
                bottom_bar("options", "", "install");
            } else {
                bottom_bar("", "", "");
            }
            get_ratings($("#" + article_id).data("slug"), ratings_callback);

            window_status = "single-article";
        }
    }

    function ratings_callback(data) {
        //console.log(data)
        if (data.ratings.length > 0) {
            apps_data.push([data.appid, data.ratings]);
        }


        data.ratings.forEach(function(item) {
            let stars = "";
            switch (item.points) {
                case 0:
                    stars = "";
                    break;
                case 1:
                    stars = "★";
                    break;
                case 2:
                    stars = "★ ★";
                    break;
                case 3:
                    stars = "★ ★ ★";
                    break;
                case 4:
                    stars = "★ ★ ★ ★";
                    break;
                case 5:
                    stars = "★ ★ ★  ★  ★";
                    break;
            }

            let temp = document.createElement("div");
            temp.innerHTML = item.description;
            let description = temp.textContent || temp.innerText;

            $("#" + article_id).append(
                "<div class='rating-item'><div><div class='points'>" +
                stars +
                "</div></div><div>" +
                description +
                "</div></div>"
            );
        });

    }

    function show_article_list() {
        $("#" + article_id).focus();
        document.getElementById(article_id).scrollIntoView();

        if (article_id == "search") {
            $("input#search").focus();
        }

        if (article_id !== "search") {
            $("#" + article_id).focus();
        }

        panels_list(panels[current_panel]);
        $("div#app div#app-panels").css("margin", "35px 0 50px 0px");

        $("article#search").css("margin", "-35px 0 0 0!Important");
        $("div#options").css("display", "none");
        if (current_panel != 0) {
            $("div#navigation").css("display", "block");
        }
        $("div#app-panels").css("display", "block");
        $("div.summary").css("display", "none");
        $("div.meta-data").css("display", "none");
        $("div.channel").css("display", "block");
        $("ul.images").css("display", "none");
        $("div.icon").css("display", "none");
        $("div.rating-item").remove();
        bottom_bar("", "select", "about");
        window_status = "article-list";
    }

    function install_app() {
        if (!offline) {
            let link_target = "";
            let targetElement = $(":focus");
            link_target = $(targetElement).data("download");
            app_slug = $(targetElement).data("slug");
            download_file(link_target);
        }
    }

    function open_url() {
        let targetElement = $(":focus");
        let link_target = $(targetElement).data("url");
        window.open(link_target, "_self ");
    }

    function open_rating() {
        $("div#rating-wrapper").css("display", "block");
        $("div#rating-wrapper input.star ").focus();
        bottom_bar("send", "", "close");
        rating_stars = 0;
        $("div#stars span").css("color", "white");
        window_status = "rating";
    }

    function close_rating() {
        $("div#rating-wrapper").css("display", "none");
        bottom_bar("", "", "");
        $("div#rating-wrapper input").val("");
        $("div#rating-wrapper textarea").val("");
        rating_stars = 0;
        open_options();
    }

    function close_options() {
        $("div.options").css("display", "none");
        $("article#" + article_id).focus();
        $("div#navigation").css("display", "none");
        $("div.summary").css("display", "block");
        $("div.meta-data").css("display", "block");
        $("div.icon").css("display", "block");
        $("div.channel").css("display", "none");
        $("ul.images").css("display", "block");
        bottom_bar("options", "", "install");
        window_status = "single-article";
    }

    function open_options() {
        let $focused = $(":focus");
        $("div.options").css("display", "none");
        $("article#" + article_id)
            .next()
            .css("display", "block");
        $("article#" + article_id)
            .next()
            .children()
            .first()
            .focus();

        bottom_bar("", "", "");
        window_status = "options";
    }

    function open_about() {
        article_id = $(":focus").attr("id");
        alert(article_id);
        document.querySelector("div#about").style.display = "block";
        document.querySelector("div#about div#inner").focus();
        document.getElementById("top").scrollIntoView();
        bottom_bar("", "", "");
        window_status = "about";
    }


    const search_listener = document.querySelector("article#search input");

    search_listener.addEventListener("focus", (event) => {
        bottom_bar("scan", "select", "about");
        window.scrollTo(0, 0);
        window_status = "search";
    });

    search_listener.addEventListener("blur", (event) => {
        bottom_bar("", "select", "about");
        window_status = "article-list";
    });



    ///launch app after installation

    function launch_app() {
        var request = window.navigator.mozApps.mgmt.getAll();
        request.onerror = function(e) {
            console.log("Error calling getInstalled: " + request.error.name);
        };
        request.onsuccess = function(e) {
            var appsRecord = request.result;
            appsRecord[appsRecord.length - 1].launch();
        };
    }

    let rating_stars = 0;
    document
        .querySelector("div#rating-wrapper input.star")
        .blur("keyup", function() {
            switch ($(this).value) {
                case "0":
                    $("div#stars span:nth-child(1)").css("color", "white");
                    $("div#stars span:nth-child(2)").css("color", "white");
                    $("div#stars span:nth-child(3)").css("color", "white");
                    $("div#stars span:nth-child(4)").css("color", "white");
                    $("div#stars span:nth-child(5)").css("color", "white");
                    rating_stars = $(this).value;

                    break;
                case "1":
                    $("div#stars span:nth-child(1)").css("color", "yellow");
                    $("div#stars span:nth-child(2)").css("color", "white");
                    $("div#stars span:nth-child(3)").css("color", "white");
                    $("div#stars span:nth-child(4)").css("color", "white");
                    $("div#stars span:nth-child(5)").css("color", "white");
                    rating_stars = $(this).value;

                    break;
                case "2":
                    $("div#stars span:nth-child(1)").css("color", "yellow");
                    $("div#stars span:nth-child(2)").css("color", "yellow");
                    $("div#stars span:nth-child(3)").css("color", "white");
                    $("div#stars span:nth-child(4)").css("color", "white");
                    $("div#stars span:nth-child(5)").css("color", "white");
                    rating_stars = $(this).value;

                    break;
                case "3":
                    $("div#stars span:nth-child(1)").css("color", "yellow");
                    $("div#stars span:nth-child(2)").css("color", "yellow");
                    $("div#stars span:nth-child(3)").css("color", "yellow");
                    $("div#stars span:nth-child(4)").css("color", "white");
                    $("div#stars span:nth-child(5)").css("color", "white");
                    rating_stars = $(this).value;

                    break;
                case "4":
                    $("div#stars span:nth-child(1)").css("color", "yellow");
                    $("div#stars span:nth-child(2)").css("color", "yellow");
                    $("div#stars span:nth-child(3)").css("color", "yellow");
                    $("div#stars span:nth-child(4)").css("color", "yellow");
                    $("div#stars span:nth-child(5)").css("color", "white");
                    rating_stars = $(this).value;

                    break;
                case "5":
                    $("div#stars span:nth-child(1)").css("color", "yellow");
                    $("div#stars span:nth-child(2)").css("color", "yellow");
                    $("div#stars span:nth-child(3)").css("color", "yellow");
                    $("div#stars span:nth-child(4)").css("color", "yellow");
                    $("div#stars span:nth-child(5)").css("color", "yellow");
                    rating_stars = $(this).value;

                    break;
            }
        });

    document.querySelector("div#rating-wrapper input.star").focus(function() {
        $("div#stars").css("font-size", "1rem");
    });
    document.querySelector("div#rating-wrapper textarea").focus(function() {
        document.querySelector("div#stars").style.fontSize = "0.8rem";
    });

    document
        .querySelector("div#rating-wrapper input.star")
        .blur("keydown", function() {
            this.value = "";
        });

    function xhr_callback(data) {
        if (data == 201) {
            toaster("Thank you for your rating!", 3000);
            close_rating();
        }
        if (data == 400) {
            toaster("I can't send anything without a rating", 3000);
        }
        if (data == 409) {
            toaster("You already posted a review for this app", 3000);
        }
        if (data == "Network Error") {
            toaster("Network Error", 3000);
        }
    }

    //////////////////////////
    ////KEYPAD TRIGGER////////////
    /////////////////////////

    function handleKeyDown(evt) {
        const isInSearchField = evt.target.id == "search" && evt.target.value != "";

        switch (evt.key) {
            case "Enter":
                if (window_status == "article-list") {
                    show_article();
                }

                if (window_status == "options") {
                    console.log($(":focus").attr("tabindex"));

                    if ($(":focus").attr("tabindex") === "0") {
                        open_rating();
                    }
                    if (
                        $(":focus").attr("tabindex") == "1" ||
                        $(":focus").attr("tabindex") == "2"
                    ) {
                        open_url();
                    }
                }
                break;

            case "ArrowDown":
                if (window_status == "about") {
                    break;
                }

                nav("+1");
                break;

            case "ArrowUp":
                if (window_status == "about") {
                    break;
                }

                nav("-1");
                break;

            case "ArrowLeft":
                if (isInSearchField) {
                    evt.preventDefault;
                    break;
                }
                if (evt.target.id == "search" && evt.target.value == "") {
                    nav_panels("left");
                    break;
                }

                if (window_status == "article-list") {
                    nav_panels("left");
                }
                break;

            case "ArrowRight":
                if (isInSearchField) break;

                if (evt.target.id == "search" && evt.target.value == "") {
                    nav_panels("right");
                    break;
                }
                if (window_status == "article-list") {
                    nav_panels("right");
                }

                break;

            case "8":
            case "SoftLeft":
                if (window_status == "search") {
                    start_scan(function(callback) {
                        let slug = callback.replace("bhackers:", "");
                        show_article(slug);
                    });

                    bottom_bar("", "", "");
                    window_status = "scan";
                }

                if (window_status == "rating") {
                    //sanitizer
                    let body = $("div#rating-wrapper textarea").val(),
                        temp = document.createElement("div");
                    temp.innerHTML = body;
                    let comment = temp.textContent || temp.innerText;

                    send_rating(
                        get_userId(),
                        get_userId(),
                        $("#" + article_id).data("slug"),
                        $("#" + article_id).data("name"),
                        Number(rating_stars),
                        comment,
                        xhr_callback
                    );

                    break;
                }

                if (window_status == "single-article") {
                    open_options();
                    break;
                }

            case "9":
            case "SoftRight":
                if (window_status == "article-list" || window_status == "search") {
                    open_about();
                    break;
                }

                if (window_status == "single-article") {
                    install_app();
                    break;
                }

                if (window_status == "post_installation") {
                    launch_app();
                    break;
                }
                if ((window_status = "rating")) {
                    close_rating();
                    break;
                }

                break;

            case "Backspace":
                if (isInSearchField) break;
                if (evt.target.id == "search" && evt.target.value == "") {
                    evt.preventDefault();

                    $("article:not(article#search)").css("display", "block");
                }

                if (
                    window_status == "single-article" ||
                    window_status == "post_installation"
                ) {
                    evt.preventDefault();

                    show_article_list();
                    break;
                }

                if (window_status == "about") {
                    evt.preventDefault();

                    $("div#about").css("display", "none");
                    show_article_list();
                    //$("div#bottom-bar div#button-center").css("width", "30%");

                    break;
                }

                if (window_status == "scan") {
                    evt.preventDefault();

                    document.getElementById("qr-screen").hidden = true;

                    break;
                }

                if (window_status == "options") {
                    evt.preventDefault();

                    close_options();
                    break;
                }
                if (
                    window_status == "article-list" &&
                    !$("input#search").is(":focus")
                ) {
                    window.close();
                }
                break;
        }
    }

    document.addEventListener("keydown", handleKeyDown);
});