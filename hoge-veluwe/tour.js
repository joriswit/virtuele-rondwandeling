$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

$(document).ready(function () {

    if (window.history && window.history.pushState) {

        $.getJSON("points.json", function (json) {
            var currentPointIndex = $.getUrlVar('p');
            var currentPoint = json[currentPointIndex];
            var currentDir = $.getUrlVar('d') - 1;
            var currentPhoto = 1;
            var originalDirection = $.getUrlVar('od') - 1;
            var route = $.getUrlVar('r');
            var routeStep = 0;
            var routeTimer;
            if (route) {
                $.getJSON("route" + parseInt(route) + ".json", function (routejson) {
                    routeTimer = setInterval(function () {
                        if (routeStep < routejson.length) {
                            switch (routejson[routeStep]) {
                                case 'f': moveForward(); break;
                                case 'l': moveLeft(); break;
                                case 'r': moveRight(); break;
                            }
                            routeStep++;
                        } else {
                            window.location.href = "endroute.html";
                        }
                    }, 600);
                });
            }

            var getUrl = function (url) {
                if (url.indexOf("http") == 0) {
                    return url;
                } else {
                    return "fotos/" + url;
                }
            }

            var updateDir = function () {

                var numberOfStepsRight;
                if (originalDirection <= currentDir) {
                    numberOfStepsRight = 1 + currentDir - originalDirection;
                } else {
                    numberOfStepsRight = 1 + -((originalDirection - currentDir) - currentPoint.d.length);
                }
                $("#pijl").attr("src", "pijlen/pijl" + currentPoint.d.length + "-" + numberOfStepsRight + ".png");

                if (currentPoint.c) {
                    $("#comment").html("Huidige punt: " + currentPoint.c);
                } else {
                    $("#comment").html("");
                }

                if (currentPoint.d[currentDir].p) {
                    var next = getMoveForwardLink();
                    $("#linkwalkforward").show().attr('href', '?p=' + next.p + '&d=' + (next.d + 1) + '&od=' + (next.od + 1));
                    $("#disabledwalkforward").hide();
                    (new Image()).src = getUrl(next.nextPoint.d[next.d].f);
                } else {
                    $("#linkwalkforward").hide();
                    $("#disabledwalkforward").show();
                }
                if (currentPoint.d.length == 2) {
                    var next = getMoveBackwardLink();
                    $("#linkturnaround").show().attr('href', '?p=' + next.p + '&d=' + (next.d + 1) + '&od=' + (next.od + 1));
                    $("#disabledturnaround").hide();
                    (new Image()).src = getUrl(next.nextPoint.d[next.d].f);
                } else {
                    $("#linkturnaround").hide();
                    $("#disabledturnaround").show();
                }
                if (currentPoint.d.length > 2) {
                    var next = getMoveLeftLink();
                    $("#linkturnleft").show().attr('href', '?p=' + next.p + '&d=' + (next.d + 1) + '&od=' + (next.od + 1));
                    $("#disabledturnleft").hide();
                    (new Image()).src = getUrl(next.nextPoint.d[next.d].f);
                    next = getMoveRightLink();
                    $("#linkturnright").show().attr('href', '?p=' + next.p + '&d=' + (next.d + 1) + '&od=' + (next.od + 1));
                    $("#disabledturnright").hide();
                    (new Image()).src = getUrl(next.nextPoint.d[next.d].f);
                } else {
                    $("#linkturnleft").hide();
                    $("#disabledturnleft").show();
                    $("#linkturnright").hide();
                    $("#disabledturnright").show();
                }
            }

            var getMoveForwardLink = function () {
                var nextPointIndex = currentPoint.d[currentDir].p;
                var nextPoint = json[nextPointIndex];
                var nextDir;
                if (nextPoint.si1 == currentPoint.d[currentDir].d) {
                    nextDir = nextPoint.si2 - 1;
                } else if (nextPoint.si2 == currentPoint.d[currentDir].d) {
                    nextDir = nextPoint.si1 - 1;
                } else {
                    var nextDir = currentPoint.d[currentDir].d - 1 + Math.floor(nextPoint.d.length / 2);
                    if (nextDir >= nextPoint.d.length) {
                        nextDir -= nextPoint.d.length;
                    }
                }

                return { nextPoint: nextPoint, p: nextPointIndex, d: nextDir, od: currentPoint.d[currentDir].d - 1 };
            }

            var moveForward = function () {
                var next = getMoveForwardLink();

                var nextPhoto = currentPhoto == 1 ? 2 : 1;

                originalDirection = next.od;
                currentPointIndex = next.p;
                currentPoint = next.nextPoint;
                currentDir = next.d;

                window.history.pushState(null, document.title, '?p=' + currentPointIndex + '&d=' + (currentDir + 1) + '&od=' + (originalDirection + 1));

                var $currentPhoto = $("#photo" + currentPhoto);
                var $nextPhoto = $("#photo" + nextPhoto);
                currentPhoto = nextPhoto;

                $nextPhoto.attr("src", getUrl(currentPoint.d[currentDir].f));

                $currentPhoto.css({ zIndex: 1 });
                $nextPhoto.css({ opacity: 0.0, width: '512px', left: '64px', height: '384px', top: '48px', zIndex: 2, display: 'block' });

                $currentPhoto.animate({
                    width: '768px',
                    left: '-64px',
                    height: '576px',
                    top: '-48px'
                }, { duration: 200, queue: false });
                $nextPhoto.animate({
                    width: '640px',
                    left: '0px',
                    height: '480px',
                    top: '0px',
                    opacity: 1.0
                }, { duration: 200, queue: false });

                updateDir();
            }

            var getMoveLeftLink = function () {
                var nextDir = currentDir - 1;
                if (nextDir < 0) {
                    nextDir = currentPoint.d.length - 1;
                }

                return { nextPoint: currentPoint, p: currentPointIndex, d: nextDir, od: originalDirection };
            }

            var moveLeft = function () {
                var next = getMoveLeftLink();

                var nextPhoto = currentPhoto == 1 ? 2 : 1;

                currentDir = next.d;

                window.history.pushState(null, document.title, '?p=' + currentPointIndex + '&d=' + (currentDir + 1) + '&od=' + (originalDirection + 1));

                var $currentPhoto = $("#photo" + currentPhoto);
                var $nextPhoto = $("#photo" + nextPhoto);
                currentPhoto = nextPhoto;

                $nextPhoto.attr("src", getUrl(currentPoint.d[currentDir].f));

                $currentPhoto.css({ zIndex: 1 });
                $nextPhoto.css({ opacity: 1.0, width: '640px', left: '-640px', height: '480px', top: '0px', zIndex: 2, display: 'block' });

                $currentPhoto.animate({
                    left: '640px'
                }, { duration: 200, queue: false });
                $nextPhoto.animate({
                    left: '0px'
                }, { duration: 200, queue: false });

                updateDir();
            }

            var getMoveRightLink = function () {
                var nextDir = currentDir + 1;
                if (nextDir >= currentPoint.d.length) {
                    nextDir = 0;
                }

                return { nextPoint: currentPoint, p: currentPointIndex, d: nextDir, od: originalDirection };
            }

            var moveRight = function () {
                var next = getMoveRightLink();

                var nextPhoto = currentPhoto == 1 ? 2 : 1;

                currentDir = next.d;

                window.history.pushState(null, document.title, '?p=' + currentPointIndex + '&d=' + (currentDir + 1) + '&od=' + (originalDirection + 1));

                var $currentPhoto = $("#photo" + currentPhoto);
                var $nextPhoto = $("#photo" + nextPhoto);
                currentPhoto = nextPhoto;

                $nextPhoto.attr("src", getUrl(currentPoint.d[currentDir].f));

                $currentPhoto.css({ zIndex: 1 });
                $nextPhoto.css({ opacity: 1.0, width: '640px', left: '640px', height: '480px', top: '0px', zIndex: 2, display: 'block' });

                $currentPhoto.animate({
                    left: '-640px'
                }, { duration: 200, queue: false });
                $nextPhoto.animate({
                    left: '0px'
                }, { duration: 200, queue: false });

                updateDir();
            }

            var getMoveBackwardLink = function () {
                var nextDir = currentDir + Math.floor(currentPoint.d.length / 2);
                if (nextDir >= currentPoint.d.length) {
                    nextDir -= currentPoint.d.length;
                }

                return { nextPoint: currentPoint, p: currentPointIndex, d: nextDir, od: originalDirection };
            }

            var moveBackward = function () {
                var next = getMoveBackwardLink();

                var nextPhoto = currentPhoto == 1 ? 2 : 1;

                currentDir = next.d;

                window.history.pushState(null, document.title, '?p=' + currentPointIndex + '&d=' + (currentDir + 1) + '&od=' + (originalDirection + 1));

                var $currentPhoto = $("#photo" + currentPhoto);
                var $nextPhoto = $("#photo" + nextPhoto);
                currentPhoto = nextPhoto;

                $nextPhoto.attr("src", getUrl(currentPoint.d[currentDir].f));

                $currentPhoto.css({ zIndex: 1 });
                $nextPhoto.css({ opacity: 1.0, width: '0px', left: '320px', height: '480px', top: '0px', zIndex: 2, display: 'block' });

                $currentPhoto.animate({
                    width: '0px',
                    left: '320px'
                }, { duration: 200 });
                $nextPhoto.animate({
                    width: '640px',
                    left: '0px'
                }, { duration: 200 });

                updateDir();
            }

            $("#photo1").attr("src", getUrl(currentPoint.d[currentDir].f));
            updateDir();

            $(document).keydown(function (e) {

                if (e.keyCode == 38) {
                    if ($("#linkwalkforward").is(":visible")) {
                        clearInterval(routeTimer);
                        moveForward();
                    }
                }
                if (e.keyCode == 40) {
                    if ($("#linkturnaround").is(":visible")) {
                        clearInterval(routeTimer);
                        moveBackward();
                    }
                }
                if (e.keyCode == 37) {
                    if ($("#linkturnleft").is(":visible")) {
                        clearInterval(routeTimer);
                        moveLeft();
                    }
                }
                if (e.keyCode == 39) {
                    if ($("#linkturnright").is(":visible")) {
                        clearInterval(routeTimer);
                        moveRight();
                    }
                }
            })
            $("#linkwalkforward").click(function () {
                clearInterval(routeTimer);
                moveForward();
                return false;
            });
            $("#linkturnleft").click(function () {
                clearInterval(routeTimer);
                moveLeft();
                return false;
            });
            $("#linkturnright").click(function () {
                clearInterval(routeTimer);
                moveRight();
                return false;
            });
            $("#linkturnaround").click(function () {
                clearInterval(routeTimer);
                moveBackward();
                return false;
            });
            window.onpopstate = function (e) {
                // go back
                clearInterval(routeTimer);

                currentPointIndex = $.getUrlVar('p');
                currentPoint = json[currentPointIndex];
                currentDir = $.getUrlVar('d') - 1;

                var nextPhoto = currentPhoto == 1 ? 2 : 1;

                var $currentPhoto = $("#photo" + currentPhoto);
                var $nextPhoto = $("#photo" + nextPhoto);
                currentPhoto = nextPhoto;

                $nextPhoto.attr("src", getUrl(currentPoint.d[currentDir].f));

                $currentPhoto.css({ zIndex: 1 });
                $nextPhoto.css({ opacity: 1.0, width: '640px', left: '0px', height: '480px', top: '0px', zIndex: 2, display: 'block' });

                updateDir();
            };
        });
    } else {
        $(document).keydown(function (e) {

            if (e.keyCode == 38) {
                if ($("#linkwalkforward").is(":visible")) {
                    window.location = document.getElementById("linkwalkforward").href;
                }
            }
            if (e.keyCode == 40) {
                if ($("#linkturnaround").is(":visible")) {
                    window.location = document.getElementById("linkturnaround").href;
                }
            }
            if (e.keyCode == 37) {
                if ($("#linkturnleft").is(":visible")) {
                    window.location = document.getElementById("linkturnleft").href;
                }
            }
            if (e.keyCode == 39) {
                if ($("#linkturnright").is(":visible")) {
                    window.location = document.getElementById("linkturnright").href;
                }
            }
        })
    }
});