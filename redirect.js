commit = "5532cdc4d6b3dd6bfe890fe7209fb998b35f4c05";

// get latest commit every week
chrome.storage.local.get(["update", "commit"], function(items) {
    if (items["update"]) {
        var ud = new Date(items["update"]);
        var today = new Date();
        var days = (today - ud) / (1000 * 60 * 60 * 24);
        if (days > 7) {
            // fetch latest commit
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var ret = JSON.parse(xhr.responseText);
                    commit = ret["sha"];
                    chrome.storage.local.set({
                        "commit": commit
                    });
                    chrome.storage.local.set({
                        "update": today.toString()
                    });
                }
            };
            xhr.open("GET", "https://api.github.com/repos/neotenic/neotenic.github.io/commits/master", true);
            xhr.send();
        }
    } else {
        commit = items["commit"] || commit;
        chrome.storage.local.set({
            "update": (new Date()).toString()
        });
    }
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var url = details.url;
    var a_slash = url.indexOf("neotenic.github.io/");
    if (a_slash < 0) {
        return {};
    }
    a_slash += "neotenic.github.io/".length;
    path = url.substring(a_slash);
    var qmark = path.indexOf("?");
    if (qmark > 0) {
        path = path.substring(0, qmark);
    }
    proto = "http";
    if (url[4] == "s") proto = "https";
    newurl = proto + "://cdn.rawgit.com/neotenic/neotenic.github.io/" + commit + "/" + path;
    return {
        redirectUrl: newurl
    };
}, {urls: ["*://*.github.io/*"]}, ["blocking"]);
