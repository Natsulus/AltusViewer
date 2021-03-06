//META{"name":"AltusViewer"}*//
function AltusViewer() {}

var observer;

AltusViewer.settings = null;
AltusViewer.sizes = null;
AltusViewer.loadedSizes = {
    "32": false,
    "400": false
};
AltusViewer.settingsButton = null;
AltusViewer.settingsPanel = null;
AltusViewer.settingsLastTab = null;
AltusViewer.animationSpeed = 0.04;
AltusViewer.iconList = {};
AltusViewer.updateLog = [];
AltusViewer.isReady = false;

AltusViewer.prototype.changeTab = function(tab) {
    AltusViewer.settingsLastTab = tab;

    //var controlGroups = $("#av-control-groups");
    $(".av-tab").removeClass("selected");
    $(".av-pane").hide();
    $("#" + tab).addClass("selected");
    $("#" + tab.replace("tab", "pane")).show();

    switch (tab) {
        case "av-settings-tab":
            break;
        case "av-icons-tab":
            break;
        case "av-stats-tab":
            break;
        case "av-updates-tab":
            break;
    }
};

AltusViewer.updateSettings = function(checkbox) {
    var cb = $(checkbox).children().find('input[type="checkbox"]');
    var enabled = !cb.is(":checked");
    var id = cb.attr("id");
    cb.prop("checked", enabled);
    AltusViewer.settings[id] = enabled;
    AltusViewer.prototype.saveSettings();
    switch (id) {
        case "altus-icons":
            if (enabled) {
                $(".chat").each(function() {
                    observer.observe(this, {
                        childList: true,
                        characterData: true,
                        attributes: false,
                        subtree: true
                    });
                });
                AltusViewer.process();
            } else {
                observer.disconnect();
                $(".iconwrapper").replaceWith(function() {
                    return $(this).attr("tooltip");
                });
                $(".av-icons-scanned").removeClass("av-icons-scanned");
            }
            break;
        case "altus-stats":
            break;
        case "altus-icon-tooltip":
            if (enabled) {
                $(".iconwrapper[tooltip]").addClass("icon-tooltip");
            } else {
                $(".iconwrapper[tooltip]").removeClass("icon-tooltip");
            }
            break;
        case "altus-hd-icons":
            AltusViewer.loadImages(enabled);
            if (enabled) {
                $(".altus-icon").each(function() {
                    $(this).css("backgroundImage", $(this).css("backgroundImage").replace("32", "400"));
                });
            } else {
                $(".altus-icon").each(function() {
                    $(this).css("backgroundImage", $(this).css("backgroundImage").replace("400", "32"));
                });
            }
            break;
    }
};

AltusViewer.updateIcons = function(form, all) {
    var value;
    $.each(AltusViewer.iconList, function(key) {
        if (all) value = +form["all-icon-size"].value;
        else value = +form[key].value;
        if (value >= 12 && value <= 40) {
            if (all) form[key].value = value;
            AltusViewer.iconList[key].size = value;
            AltusViewer.sizes[key] = value;
            $(".av-icon-table").find("div[menu-icon='" + key + "']").css({
                "width": value + "px",
                "height": value + "px",
                "backgroundSize": value + "px auto"
            });
            var $icon = $(".iconwrapper[tooltip='" + key + "']");
            $icon.css("top", Math.ceil((value - 8) / 2.5) + "px");
            $icon.find("*").css({
                "width": value + "px",
                "height": value + "px",
                "backgroundSize": value + "px auto"
            });
        } else {
            form[key].value = AltusViewer.iconList[key].size;
        }
    });
    AltusViewer.prototype.saveSizes();
};

AltusViewer.createSettings = function() {
    AltusViewer.settingsPanel = $("<div/>", {
        id: "av-pane",
        class: "settings-inner",
        css: {
            "display": "none"
        }
    });

    var settingsInner = '<div class="scroller-wrap">' + '<div class="scroller settings-wrapper settings-panel">' + '<div class="tab-bar TOP">' + '<div class="tab-bar-item av-tab" id="av-settings-tab" onclick="AltusViewer.prototype.changeTab(\'av-settings-tab\');">Altus Viewer</div>' + '<div class="tab-bar-item av-tab" id="av-icons-tab" onclick="AltusViewer.prototype.changeTab(\'av-icons-tab\');">Icons</div>' + '<div class="tab-bar-item av-tab" id="av-updates-tab" onclick="AltusViewer.prototype.changeTab(\'av-updates-tab\');">Updates</div>'
        //+ '<div class="tab-bar-item av-tab" id="av-stats-tab" onclick="AltusViewer.prototype.changeTab(\'av-stats-tab\');">Stats</div>'
        + '</div>' + '<div class="av-settings">' + '<div class="av-pane control-group" id="av-settings-pane" style="display: none;">' + '<ul class="checkbox-group">';

    for (var aSetting in AltusViewer.settingsArray) {
        var setting = AltusViewer.settingsArray[aSetting];
        var id = setting["id"];
        if (setting["implemented"]) {
            settingsInner += '<li>' + '<div class="checkbox" onclick="AltusViewer.updateSettings(this);">' + '<div class="checkbox-inner">' + '<input type="checkbox" id="' + id + '" ' + (AltusViewer.settings[id] ? "checked" : "") + '>' + '<span></span>' + '</div>' + '<span>' + aSetting + ' - ' + setting["info"] + '</span>' + '</div>' + '</li>';
        }
    }

    settingsInner += '</ul>' + '</div>' + '<div class="av-pane control-group" id="av-icons-pane" style="display: none;">' + '<table class="av-icon-table">' + '<thead>' + '<tr>' + '<th width="100px">Icon</th>' + '<th>Identifier</th>' + '<th width="50px">Size</th>' + '</tr>' + '</thead>' + '<form name="iconform" action="" method="get">' + '<tbody>';

    $.each(AltusViewer.iconList, function(key, icon) {
        settingsInner += '<tr>';


        var iconImage;
        if (icon.type == "image") {
            iconImage = document.createElement("div");
            iconImage.className = "altus-icon";
            iconImage.style.width = icon.size + "px";
            iconImage.style.height = icon.size + "px";
            iconImage.style.backgroundImage = "url('" + icon.url + "')";
            iconImage.style.backgroundSize = icon.size + "px auto";
            iconImage.style.display = "inline-block";
        } else if (icon.type == "animation") {
            iconImage = document.createElement("div");
            iconImage.className = "altus-icon altus-icon-sprite";
            iconImage.style.width = icon.size + "px";
            iconImage.style.height = icon.size + "px";
            iconImage.style.animationTimingFunction = "steps(" + (icon.steps - 1) + ")";
            iconImage.style.animationDuration = (icon.steps * AltusViewer.animationSpeed) + "s";
            iconImage.style.backgroundImage = "url('" + icon.url + "')";
            iconImage.style.backgroundSize = icon.size + "px auto";
            iconImage.style.marginLeft = "auto";
            iconImage.style.marginRight = "auto";
            iconImage.style.display = "inline-block";
        }
        iconImage.setAttribute("menu-icon", key);

        settingsInner += '<td>' + iconImage.outerHTML + '</td>';

        settingsInner += '<td>' + key + '</td>';

        settingsInner += '<td><input type="number" min="12" max="40" step="4" name="' + key + '" value="' + icon.size + '"></td>';

        settingsInner += '</tr>';
    });

    settingsInner += '<tr>' + '<td colspan="2"><input type="button" value="Update All Icons" onclick="AltusViewer.updateIcons(this.form, true)""></td>' + '<td><input type="number" min="12" max="40" step="4" name="all-icon-size" value="32"></td>' + '</td>' + '</tbody>' + '</table>' + '<input type="button" value="Update" onclick="AltusViewer.updateIcons(this.form)" style="float: right; margin-top: 10px;">' + '</form>' + '</div>' + '<div class="av-pane control-group" id="av-stats-pane" style="display: none;">' + '<span>Stats</span>' + '</div>' + '<div class="av-pane control-group" id="av-updates-pane" style="display: none;">' + '<span>Current Version: ' + AltusViewer.prototype.getVersion() + '</span>';
    if (AltusViewer.prototype.getVersion() == AltusViewer.updateLog[0].version)
        settingsInner += '<span style="float: right;">Up To Date</span>';
    else
        settingsInner += '<span style="float: right;"><a href="https://raw.githubusercontent.com/Natsulus/AltusViewer/gh-pages/altus/AltusViewer.js" download>Update to Version ' + AltusViewer.updateLog[0].version + '</a></span>';

    settingsInner += '<div class="update-log" style="height: 325px;">';
    for (var i = 0; i < AltusViewer.updateLog.length; i++) {
        settingsInner += '<div class="update-title">' + AltusViewer.updateLog[i].version + ' - ' + AltusViewer.updateLog[i].type +'</div>';
        settingsInner += '<div class="update-list">';
        for (var j = 0; j < AltusViewer.updateLog[i].data.length; j++) {
            settingsInner += '<li>' + AltusViewer.updateLog[i].data[j] + '</li>';
        }
        settingsInner += '</div>';
    }
    settingsInner += '</div></div></div></div></div>';

    function showSettings() {
        $(".tab-bar-item").removeClass("selected");
        AltusViewer.settingsButton.addClass("selected");
        $(".form .settings-right .settings-inner").hide();

        AltusViewer.settingsPanel.show();

        if (AltusViewer.settingsLastTab == null) {
            AltusViewer.prototype.changeTab("av-settings-tab");
        } else {
            AltusViewer.prototype.changeTab(AltusViewer.settingsLastTab);
        }
    }

    AltusViewer.settingsButton = $("<div/>", {
        class: "tab-bar-item",
        text: "Altus Viewer",
        id: "av-settings-new",
        click: function(event) {
            event.stopImmediatePropagation();
            showSettings();
        }
    });

    AltusViewer.settingsPanel.html(settingsInner);

    function defer() {
        var $btnSettings = $(".btn.btn-settings");
        if ($btnSettings.length < 1) {
            setTimeout(defer, 100);
        } else {
            $btnSettings.first().on("click", function() {

                function innerDefer() {
                    if ($(".modal-inner").first().is(":visible")) {

                        AltusViewer.settingsPanel.hide();
                        var tabBar = $(".tab-bar.SIDE").first();

                        $(".tab-bar.SIDE .tab-bar-item:not(#bd-settings-new)").click(function() {
                            $(".form .settings-right .settings-inner").first().show();
                            $("#av-settings-new").removeClass("selected");
                            AltusViewer.settingsPanel.hide();
                        });
                        var tabBarSet = setInterval(function() {
                            var bdtab = $("#bd-settings-new");
                            if (bdtab.length > 0) {
                                clearInterval(tabBarSet);
                                tabBar.append(AltusViewer.settingsButton);
                                $("#av-settings-new").removeClass("selected");
                                bdtab.click(function() {
                                    $("#av-settings-new").removeClass("selected");
                                    AltusViewer.settingsPanel.hide();
                                });
                            }
                        }, 50);

                        $(".form .settings-right .settings-inner").last().after(AltusViewer.settingsPanel);
                        $("#av-settings-new").removeClass("selected");
                    } else {
                        setTimeout(innerDefer, 100);
                    }
                }

                innerDefer();
            });
        }
    }

    defer();
};

Array.prototype.extend = function(other_array) {
    /* you should include a test to check whether other_array really is an array */
    other_array.forEach(function(v) {
        this.push(v)
    }, this);
};

AltusViewer.settingsArray = {
    "Enable Icons": {
        "id": "altus-icons",
        "info": "Show AltusRPG Icons",
        "default": true,
        "implemented": true
    },
    "Enable Stats": {
        "id": "altus-stats",
        "info": "Enables AltusRPG Profile",
        "default": true,
        "implemented": false
    },
    "Enable Icon Tooltip": {
        "id": "altus-icon-tooltip",
        "info": "Shows AltusRPG Icon Names on Hover",
        "default": true,
        "implemented": true
    },
    "Enable HD Icons": {
        "id": "altus-hd-icons",
        "info": "Use 400x400 icons.",
        "default": false,
        "implemented": true
    }
};

AltusViewer.prototype.saveSettings = function() {
    localStorage.setItem("altusSettings", JSON.stringify(AltusViewer.settings));
};

AltusViewer.prototype.getDefaultSettings = function() {
    var defaultSettings = {};
    for (var setting in AltusViewer.settingsArray) {
        defaultSettings[AltusViewer.settingsArray[setting]["id"]] = AltusViewer.settingsArray[setting]["default"];
    }
    return defaultSettings;
};

AltusViewer.prototype.saveSizes = function() {
    localStorage.setItem("altusSizes", JSON.stringify(AltusViewer.sizes));
};

AltusViewer.prototype.getDefaultSizes = function() {
    var defaultSizes = {};
    for (var icon in AltusViewer.iconList) {
        defaultSizes[icon] = AltusViewer.iconList[icon].size;
    }
    return defaultSizes;
};

AltusViewer.applySizes = function() {
    for (var icon in AltusViewer.sizes) {
        if (AltusViewer.iconList.hasOwnProperty(icon)) {
            AltusViewer.iconList[icon].size = AltusViewer.sizes[icon];
        }
    }
};

AltusViewer.preloadImages = function(size) {
    if (!AltusViewer.preloadImages.list || AltusViewer.preloadImages.list.length !== 0) {
        AltusViewer.preloadImages.list = [];
    }

    for (var icon in AltusViewer.iconList) {
        var img = new Image();
        img.onload = function() {
            var index = AltusViewer.preloadImages.list.indexOf(this);
            if (index !== -1) {
                AltusViewer.preloadImages.list.splice(index, 1);
                if (AltusViewer.preloadImages.list.length == 0) {
                    AltusViewer.loadedSizes[size] = true;
                    console.log("[Altus Viewer] " + size + "x" + size + " Icons Preloaded");
                }
            }
        };
        AltusViewer.preloadImages.list.push(img);
        img.src = AltusViewer.iconList[icon].url;
    }
    console.log("[Altus Viewer] Preloading " + AltusViewer.preloadImages.list.length + " icon(s)")
};

AltusViewer.loadImages = function(enabled) {
    if (enabled) {
        $.getJSON("https://natsulus.github.io/AltusViewer/altus/data/icons-400.json", function(list) {
            AltusViewer.iconList = list;
            AltusViewer.applySizes();
            AltusViewer.isReady = true;
            if (!AltusViewer.loadedSizes["400"]) AltusViewer.preloadImages("400");
        }).fail(function(xhr, status, error) {
            console.log("[Altus Viewer] Error Loading Icon List '" + status + ":" + error + "'. Using fallback");
            AltusViewer.isReady = true;
        });
    } else {
        $.getJSON("https://natsulus.github.io/AltusViewer/altus/data/icons-32.json", function(list) {
            AltusViewer.iconList = list;
            AltusViewer.applySizes();
            AltusViewer.isReady = true;
            if (!AltusViewer.loadedSizes["32"]) AltusViewer.preloadImages("32");
        }).fail(function(xhr, status, error) {
            console.log("[Altus Viewer] Error Loading Icon List '" + status + ":" + error + "'. Using fallback");
            AltusViewer.isReady = true;
        });
    }
};

AltusViewer.getUpdateLog = function() {
    $.ajax({
        url: "https://natsulus.github.io/AltusViewer/altus/data/updates.json",
        dataType: 'json',
        async: false,
        success: function (log) {
            AltusViewer.updateLog = log;
        }
    });
};

AltusViewer.prototype.load = function() {
    AltusViewer.settings = JSON.parse(localStorage.getItem("altusSettings")) || AltusViewer.prototype.getDefaultSettings();
    AltusViewer.sizes = JSON.parse(localStorage.getItem("altusSizes")) || AltusViewer.prototype.getDefaultSizes();
    AltusViewer.prototype.saveSettings();
    AltusViewer.prototype.saveSizes();

    AltusViewer.getUpdateLog();

    AltusViewer.loadImages(AltusViewer.settings["altus-hd-icons"]);

    $('head').append(
        '<style id="altus-css">'
        + '.update-title {font-size: 1.5em; margin-top: 0.67em; margin-bottom: 0.67em; margin-left: 0; margin-right: 0;}'
        + '.update-list {list-style-type: disc}'
        + '.update-log {background: white url(https://natsulus.github.io/AltusViewer/altus/data//bg-panel.png) repeat-x bottom left; border: 1px solid #3C769D; color: #333333; padding: 11px; margin: 10px 0; overflow-y: auto; }'
        + '.iconwrapper {display: inline-block; position: relative;}'
        + '.altus-icon-sprite {animation: play 1s steps(1) infinite;}' + '@keyframes play {from{background-position: 0 0;} to {background-position: 0 100%;}}' + '.av-icon-table {text-align: center; width: 520px; white-space: nowrap; margin: 0 auto;}'
        + '.av-icon-table thead th {background: #EBEBEB!important; text-align: center;}'
        + '.av-icon-table tbody td, .av-icon-table thead th {color: #87909c!important; padding: 5px!important;}'
        + '.av-icon-table tbody tr {background: #F7F7F7!important;}'
        + '.av-icon-table tbody td {text-align: center; font-size: small;}'
        + '.icon-tooltip{display: inline-block; position: relative;}'
        + '.icon-tooltip:hover:after{background: rgba(31,31,31,0.6); border: 1px solid rgba(142,142,142,0.6); border-radius: 5px; top: -24px; color: #fff; content: attr(tooltip); left: -20px; padding: 3px 10px; position: absolute; z-index: 98; white-space: nowrap;}'
        + '</style>"'
    );
};

AltusViewer.prototype.unload = function() {
    //
};

AltusViewer.prototype.start = function() {
    setInterval(AltusViewer.getUpdateLog, 1000 * 60 * 60);
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var startTry = setInterval(function() {
        if (AltusViewer.isReady) clearInterval(startTry);
        else return;

        observer = new MutationObserver(function() {
            AltusViewer.process();
        });

        var chatRetry = setInterval(function() {
            $(".chat").each(function() {
                clearInterval(chatRetry);
                if (AltusViewer.settings["altus-icons"]) {
                    observer.observe(this, {
                        childList: true,
                        characterData: true,
                        attributes: false,
                        subtree: true
                    });
                    AltusViewer.process();
                }
            });
        }, 100);
        AltusViewer.createSettings();
        console.log("[Altus Viewer] Started");
    }, 100);
};

AltusViewer.parseIcon = function(node) {
    var returnArr = [];
    if (node.length > 0) {
        var html = node.nodeValue;
        var match = false;
        $.each(AltusViewer.iconList, function(key, icon) {
            if (match) return;
            var index = html.lastIndexOf(key);
            if (index !== -1) {
                match = true;
                returnArr.extend(AltusViewer.parseIcon(document.createTextNode(html.slice(0, index))));

                var iconNode = document.createElement("div");
                iconNode.className = "iconwrapper";
                iconNode.setAttribute("tooltip", key);
                if (AltusViewer.settings["altus-icon-tooltip"]) iconNode.className += " icon-tooltip";
                iconNode.style.cssText = "top: " + Math.ceil((icon.size - 8) / 2.5) + "px";
                var iconImage;
                if (icon.type == "image") {
                    iconImage = document.createElement("div");
                    iconImage.className = "altus-icon";
                    iconImage.style.width = icon.size + "px";
                    iconImage.style.height = icon.size + "px";
                    iconImage.style.backgroundImage = "url('" + icon.url + "')";
                    iconImage.style.backgroundSize = icon.size + "px auto";
                } else if (icon.type == "animation") {
                    iconImage = document.createElement("div");
                    iconImage.className = "altus-icon altus-icon-sprite";
                    iconImage.style.width = icon.size + "px";
                    iconImage.style.height = icon.size + "px";
                    iconImage.style.animationTimingFunction = "steps(" + (icon.steps - 1) + ")";
                    iconImage.style.animationDuration = (icon.steps * AltusViewer.animationSpeed) + "s";
                    iconImage.style.backgroundImage = "url('" + icon.url + "')";
                    iconImage.style.backgroundSize = icon.size + "px auto";
                }
                iconNode.appendChild(iconImage);
                returnArr.push(iconNode);

                returnArr.extend(AltusViewer.parseIcon(document.createTextNode(html.slice(index + key.length))));
            }
        });
    }
    if (returnArr.length > 0) return returnArr;
    return [node];
};

AltusViewer.process = function() {
    $(".edited:not(edited-scanned)").each(function() {
        $(this).siblings().filter(".av-icons-scanned").removeClass("av-icons-scanned");
    }).addClass("edited-scanned");

    $(".message-content>span:not(.av-icons-scanned),.comment .markup>span:not(.av-icons-scanned)").each(function() {
        $(this).contents().filter(function() {
            return this.nodeType === 3;
        }).each(function() {
            var rarr = AltusViewer.parseIcon(this);
            for (var i = 0; i < rarr.length; i++) {
                this.parentNode.insertBefore(rarr[i], this);
            }
            if (rarr.length > 1) this.remove();
        })

    }).addClass("av-icons-scanned");
};

AltusViewer.prototype.stop = function() {
    observer.disconnect();
    $(".iconwrapper").replaceWith(function() {
        return $(this).attr("tooltip");
    });
    $(".av-icons-scanned").removeClass("av-icons-scanned");
    AltusViewer.settingsButton.hide();
    console.log("[Altus Viewer] Stopped");
};

AltusViewer.prototype.update = function() {
    console.log("[Altus Viewer] Updated");
};

AltusViewer.prototype.getName = function() {
    return "Altus Viewer";
};

AltusViewer.prototype.getDescription = function() {
    return "View AltusRPG Icons. Stat viewer to be added.";
};

AltusViewer.prototype.getVersion = function() {
    return "1.1.1";
};

AltusViewer.prototype.getAuthor = function() {
    return "Natsulus";
};