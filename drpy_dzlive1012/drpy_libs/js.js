// 后台(无界面)启动一个webview判断是否有cookie，没有就自动点击按钮获取
var need_cookid = executeWebRule(
    'https://bh83qv.art/vodtype/70.html',
    $.toString(() => {
        // 需要获取的cookie标志
        let need_cookie_flag = 'hasVisitedIndex'
        // 当前拥有的cookie
        let current_cookie = document.cookie

        // 判断是否拥有需要的cookie
        if (current_cookie.indexOf(need_cookie_flag) == -1) {
            // 延迟执行js代码，先让子弹飞一回(为了等dom加载完，window.onload测试不能用，变向用延迟)
            setTimeout(() => {
                // 获取2个按钮的dom，存在就执行点击操作
                document.getElementById('enterButton') ? document.getElementById('enterButton').click() : null
                document.getElementById('confirmButton') ? document.getElementById('confirmButton').click() : null
            }, 3000)
        } else {
            // 当前拥有的cookie含有需要cookie，那就返回
            fba.log("获取到cookie")
            return document.cookie
        }
    })
)

// 打印获取到的cookie
log(need_cookid)