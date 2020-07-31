$('#token').on('input', (e) => {
    if ($('#token').val().length > 0) {
        $('.next-button').removeClass('disabled').addClass('waves-effect ');
        $('.next-button').text('提交');
    } else {
        $('.next-button').addClass('disabled').removeClass('waves-effect ');
        $('.next-button').text('请输入身份令牌');
    }
});

$(".next-button").on('click', (e) => {
    if (/disabled/.test($('.next-button').attr('class'))) {
        //do nothing
    } else {
        $('.next-button').addClass('disabled').removeClass('waves-effect ');
        $('.next-button').text('正在验证令牌');
        $.ajax({
            url: '/api/performlink',
            type: 'post',
            data: {
                token: $('#token').val(),
            },
            success: (b) => {
                if (b.status === 0) {
                    M.toast({
                        html: '连接成功，正在跳转...',
                    });
                    setTimeout(() => {
                        if (getUrlParam("callback")) {
                            window.location.href = getUrlParam("callback")
                        } else {
                            window.location.href = '/';
                        }
                    }, 1000);
                } else {
                    $('#token').val('');
                    $('.next-button').addClass('disabled').removeClass('waves-effect ');
                    $('.next-button').text('请重新输入身份令牌');
                    M.toast({
                        html: `连接失败，原因：${b.msg}`,
                    });
                }
            }
        });
    }
});

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    return r === null ? false : unescape(r[2]);
}