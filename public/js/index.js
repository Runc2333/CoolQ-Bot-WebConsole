var isiPhone = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);

$("#support").on("click", (e) => {
    if (isiPhone) {
        window.open('mqqwpa://im/chat?chat_type=wpa&uin=814537405&version=1&src_type=web');
    } else {
        window.open('http://wpa.qq.com/msgrd?v=3&uin=814537405&site=qq&menu=yes');
    }
});