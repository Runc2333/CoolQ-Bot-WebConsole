$('.switchBox').on('click', function () {
    $(`#${$(this).attr('forp')}`).click();
});

$('.switch').on('click', function (e) {
    e.stopPropagation();
})

$('[type=checkbox]').on('click', function (e) {
    $.ajax({
        url: '/api/pluginswitch',
        type: 'POST',
        data: {
            groupId: getUrlParam('groupId'),
            plugin: $(this).attr('id'),
            state: $(this).prop('checked') ? 1 : 0
        },
        success: (data) => {
            if (data.status === 0) {
                M.toast({
                    html: `成功：${data.msg}`,
                });
            } else {
                M.toast({
                    html: `失败：${data.msg}`,
                });
                $(this).prop('checked', !$(this).prop('checked'))
            }
            
        }
    });
});

function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
    var r = window.location.search.substr(1).match(reg);  //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}