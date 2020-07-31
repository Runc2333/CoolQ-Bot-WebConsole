$("[data-target='status']").addClass("active");

/*载入当前数据*/
function getServerStatus() {
    $.ajax({
        url: "/api/status",
        type: "POST",
        timeout: 60000,
        data: {
            groupId: getUrlParam("groupId"),
        },
        success: function (data) {
            var obj = data;
            if (obj.status == 1) {
                M.toast({
                    html: `获取失败，原因：${obj.msg}`,
                });
            } else {
                //初始化变量
                var capacityToday = parseInt(obj.data.capacityToday);
                var capacityYesterday = parseInt(obj.data.capacityYesterday);
                if (capacityToday < capacityYesterday) {
                    $($(".progressData")[0]).text(capacityYesterday);
                    $($(".progressBar.filled")[0]).css("width", "100%");
                    setTimeout(function () {
                        var left = (parseFloat($($(".progressBar.filled")[0]).css("width").replace(/px/g, "")) - (parseFloat($($(".progressData")[0]).css("width").replace(/px/g, "")) / 2));
                        if (left > $($(".progressBar.filled")[0]).width() - parseFloat($($(".progressData")[0]).css("width").replace(/px/g, ""))) {
                            left = $($(".progressBar.filled")[0]).width() - parseFloat($($(".progressData")[0]).css("width").replace(/px/g, ""));
                        }
                        if (left < 0) {
                            left = 0;
                        }
                        $($(".progressData")[0]).css("left", left + "px");
                    }, 300);
                    $($(".progressData")[1]).text(capacityToday);
                    $($(".progressBar.filled")[1]).css("width", capacityToday / capacityYesterday * 100 + "%");
                    setTimeout(function () {
                        var left = (parseFloat($($(".progressBar.filled")[1]).css("width").replace(/px/g, "")) - (parseFloat($($(".progressData")[1]).css("width").replace(/px/g, "")) / 2));
                        if (left > $($(".progressBar.filled")[1]).width() - parseFloat($($(".progressData")[1]).css("width").replace(/px/g, ""))) {
                            left = $($(".progressBar.filled")[1]).width() - parseFloat($($(".progressData")[1]).css("width").replace(/px/g, ""));
                        }
                        if (left < 0) {
                            left = 0;
                        }
                        $($(".progressData")[1]).css("left", left + "px");
                    }, 300);
                } else {
                    $($(".progressData")[0]).text(capacityYesterday);
                    $($(".progressBar.filled")[0]).css("width", capacityYesterday / capacityToday * 100 + "%");
                    setTimeout(function () {
                        var left = (parseFloat($($(".progressBar.filled")[0]).css("width").replace(/px/g, "")) - (parseFloat($($(".progressData")[0]).css("width").replace(/px/g, "")) / 2));
                        if (left > $($(".progressBar.filled")[0]).width() - parseFloat($($(".progressData")[0]).css("width").replace(/px/g, ""))) {
                            left = $($(".progressBar.filled")[0]).width() - parseFloat($($(".progressData")[0]).css("width").replace(/px/g, ""));
                        }
                        if (left < 0) {
                            left = 0;
                        }
                        $($(".progressData")[0]).css("left", left + "px");
                    }, 300);
                    $($(".progressData")[1]).text(capacityToday);
                    $($(".progressBar.filled")[1]).css("width", "100%");
                    setTimeout(function () {
                        var left = (parseFloat($($(".progressBar.filled")[1]).css("width").replace(/px/g, "")) - (parseFloat($($(".progressData")[1]).css("width").replace(/px/g, "")) / 2));
                        if (left > $($(".progressBar.filled")[1]).width() - parseFloat($($(".progressData")[1]).css("width").replace(/px/g, ""))) {
                            left = $($(".progressBar.filled")[1]).width() - parseFloat($($(".progressData")[1]).css("width").replace(/px/g, ""));
                        }
                        if (left < 0) {
                            left = 0;
                        }
                        $($(".progressData")[1]).css("left", left + "px");
                    }, 300);
                }
            }
        },
        error: function (xhr) {
            M.toast({
                html: `获取失败，原因：网络错误`,
            });
        }
    });
}
getServerStatus();
setInterval(function () {
    getServerStatus();
}, 3000);

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    return r === null ? false : unescape(r[2]);
}