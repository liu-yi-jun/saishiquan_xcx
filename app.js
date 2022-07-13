// app.js
import { requestUrls } from "./request/config"
import Api from "./request/api";
import Req from "./request/req";
let env = "Dev";
App.requestUrls = requestUrls[env]
App.getToken = function getToken(code) {
  return new Promise((resolve, reject) => {
    Req.fetch(Api.getToken, {
      code
    }).then(res => {
      wx.setStorageSync('wx-token', res)
      resolve()
    }).catch(err => reject(err))
  })
}
App({
  Api,
  get: Req.fetch,
  post: (url, data, {
    loading = ['加载中...'],
    toast = false,
    method = 'POST'
  } = {}) => {
    return Req.fetch(url, data, {
      loading,
      toast,
      method
    });
  },
  globalData: {},
  promisify(original) {
    return function (opt) {
      return new Promise((resolve, reject) => {
        opt = Object.assign({
          success: resolve,
          fail: reject
        }, opt);
        original(opt)
      })
    }
  },
  onLaunch() {
    this.initLogin()
  },
  initLogin() {
    return new Promise((resolve, reject) => {
      let token = wx.getStorageSync('wx-token')
      try {
        if (token) {
          this.promisify(wx.checkSession)().then(() => {
            this.getServerUserInfo().then(() => {
              resolve()
            })
          }).catch(() => {
            this.login().then(() => {
              resolve()
            })
          })
        } else {
          this.login().then(() => {
            resolve()
          })
        }
      } catch (err) {
        reject(err)
      }
    })
  },
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          App.getToken(res.code).then(() => {
            this.getServerUserInfo().then(() => {
              resolve()
            })
          })
        },
        fail: err => reject(err)
      })
    })
  },
  getServerUserInfo() {
    return new Promise((resolve, reject) => {
      this.get(this.Api.getServerUserInfo, {}, {
        loading: false
      }).then((res) => {
        if (res.userInfo) {
          // 有用户信息，存入app
          this.globalData.userInfo = res.userInfo
        } else {
          // 没有用户信息等待用户授权
        }
        resolve()
      }).catch((err) => {
        reject(err)
      })
    })
  },
})