let i = -1;
let debug = "false";
let page = 0;
let pos_focus = 0
let article_array;
let tabindex_i = -0;
let window_status = "article-list";
let dataSet;

$(document).ready(function() {

    check_iconnection();

    //////////////////////////////
    //fetch-database////
    //////////////////////////////


    function getJson() {
        let xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://banana-hackers.gitlab.io/store-db/data.json');
        xhr.responseType = 'json';


        xhr.send();

        xhr.onload = function() {
            if (xhr.status != 200) { // analyze HTTP status of the response
                toaster(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
            } else { // show the result
                dataSet = xhr.response;
                addAppList()
                $("div#message-box").css('display', 'none');

            }
        };



        xhr.onprogress = function(event) {
            if (event.lengthComputable) {
                //toaster(`Received ${event.loaded} of ${event.total} bytes`);
            } else {
                //toaster(`Received ${event.loaded} bytes`); // no Content-Length
            }

        };

        xhr.onerror = function() {
            toaster("Request failed, please try later.");
        };
    }

    getJson()

    function addAppList() {

        dataSet.apps.forEach(function(value, index) {
            let data = dataSet.apps[index];


            let item_title = data.name;
            let item_summary = data.description;
            let item_link = data.download.url;
            let item_url = data.git_repo;

            let item_categorie = data.meta.categories;
            let item_author = data.author;
            let item_icon = data.icon;
            let item_license = data.license;
            let item_type = data.type;

            let meta_data = "<div class='meta-data'><div><span>Author </span>" + item_author + "</div><div><span>License </span>" + item_license + "</div><div><span>Type </span>" + item_type + "</div></div>";
            let urls = "data-download ='" + item_link + "'data-url ='" + item_url + "'";


            let article = $("<article " + urls + "><div class='icon'><img src='" + item_icon + "'></div><div class='channel'>" + item_categorie + "</div><h1>" + item_title + "</h1><div class='summary'>" + item_summary + "</div>" + meta_data + "</article>");
            $('div#news-feed-list').append(article);


        });

        sort_data()
    }


    function set_tabindex() {

        $('div#news-feed-list article').each(function(index) {

            $(this).prop("tabindex", index);
            $('div#news-feed-list article:first').focus()


        })
    }


    function sort_data() {

        let $wrapper = $('div#news-feed-list');

        $wrapper.find('article').sort(function(a, b) {
                return +b.dataset.order - +a.dataset.order;
            })
            .appendTo($wrapper);

        article_array = $('div#news-feed-list article')
        set_tabindex()
    }



    ////////////////////////
    //NAVIGATION
    /////////////////////////



    function nav(move) {

        if (window_status == "article-list") {
            let $focused = $(':focus')[0];



            if (move == "+1" && pos_focus < article_array.length - 1) {
                pos_focus++

                if (pos_focus <= article_array.length) {

                    let focusedElement = $(':focus')[0].offsetTop + 20;


                    window.scrollTo({
                        top: focusedElement,
                        left: 100,
                        behavior: 'smooth'
                    });


                    let targetElement = article_array[pos_focus];
                    targetElement.focus();


                }
            }

            if (move == "-1" && pos_focus > 0) {
                pos_focus--
                if (pos_focus >= 0) {
                    let targetElement = article_array[pos_focus];
                    targetElement.focus();
                    let focusedElement = $(':focus')[0].offsetTop;
                    window.scrollTo({ top: focusedElement + 20, behavior: 'smooth' });

                }
            }
        }

    }




    function show_article() {
        let $focused = $(':focus');
        $('article').css('display', 'none')
        $focused.css('display', 'block')
        $('div.summary').css('display', 'block');
        $('div.meta-data').css('display', 'block');
        $('div.icon').css('display', 'block');
        $('div.channel').css('display', 'none');



        $('div#button-bar').css('display', 'block')
        window_status = "single-article";

    }


    function show_article_list() {
        let $focused = $(':focus');

        $('div#news-feed-list').css('display', 'block');
        $('article').css('display', 'block')
        $('div.summary').css('display', 'none');
        $('div.meta-data').css('display', 'none');
        $('div.channel').css('display', 'block');

        $('div.icon').css('display', 'none');

        let targetElement = article_array[pos_focus];
        targetElement.focus();

        window.scrollTo(0, $(targetElement).offset().top);

        $("div#source-page").css("display", "none");
        $("div#source-page iframe").attr("src", "");
        window_status = "article-list";

    }







    function download() {
        let targetElement = article_array[pos_focus];
        let link_target = $(targetElement).data('download');
        window.location.assign(link_target)

    }

    function open_url() {
        let targetElement = article_array[pos_focus];
        let link_target = $(targetElement).data('url');

        $('div#news-feed-list').css('display', 'none');
        $("div#source-page").css("display", "block");
        $("div#source-page iframe").attr("src", link_target);
        $('div#button-bar').css('display', 'none');
        window_status = "source-page";

    }






    //////////////////////////
    ////KEYPAD TRIGGER////////////
    /////////////////////////



    function handleKeyDown(evt) {

        switch (evt.key) {


            case 'Enter':
                show_article();
                break;


            case 'ArrowDown':
                nav("+1");
                break;


            case 'ArrowUp':
                nav("-1");
                break;


            case 'SoftLeft':
                if (window_status == "single-article") {
                    open_url();
                }
                break;

            case 'SoftRight':
                download();
                if (window_status == "single-article") {
                    download();
                }
                break;


            case 'Backspace':
                evt.preventDefault();
                if (window_status == "single-article" || window_status == "source-page") {
                    show_article_list();
                    return;

                }
                if (window_status == "article-list") { window.close() }
                break;




        }

    };



    document.addEventListener('keydown', handleKeyDown);






});