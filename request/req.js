let fetch = (url, data, {
    loading = ['加载中...'],
    toast = false,
    method = 'GET'
} = {}) => {
    return new Promise((resolve, reject) => {
        if (loading.length) {
            wx.showLoading({
                title: loading[0],
                mask: true
            })
        }
        let env = App.requestUrls.baseUrl;
        wx.request({
            url: env + url,
            data,
            method,
            header: {
                "token": wx.getStorageSync('wx-token')
            },
            success: function (res) {
                let result = res.data; // { code:0,data:"",message:"" }
                console.log(result)
                if (result.code === -2) {
                    // 无效token
                    wx.login({
                        success: res => {
                            App.getToken(res.code).then(() => {
                                module.exports.fetch(url, data, {
                                    loading,
                                    toast,
                                    method
                                }).then(res => resolve(res)).catch((err) => reject(err))
                            })
                        }
                    })
                    return
                }
                result.code == 0 ? resolve(result.data) : reject(new Error(result.message))
                if (toast instanceof Array && toast.length) {
                    wx.showToast({
                        mask: true,
                        title: result.message || toast[0],
                        icon: "none"
                    })
                } else {
                    if (loading) wx.hideLoading();
                }
            },
            fail: function (e) {
                let msg = e.errMsg;
                if (msg == "request:fail timeout") {
                    msg = '请求超时，请稍后重试';
                }
                // 注意这里有空格
                if (msg == "request:fail ") {
                    msg = '服务器维护中，请稍后重试';
                }
                wx.showToast({
                    mask: true,
                    title: msg,
                    icon: "none"
                })
                reject(e);
            }
        })
    })

}
export default {
    fetch
}