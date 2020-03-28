// miniprogram/pages/authorization/authorization.js
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isWaiting: true,
  },

  onLoad: function() {
    this.auth()
    // console.log(app.globalData)
  },

  async auth() {
    var that = this;
    var onGetSetting = await that.onGetSetting();
    var isTokenValid = that.isTokenValid();
    if (isTokenValid) {
      var keepLogin = await that.keepLogin()
    }
    if (app.globalData.accessToken) { // 已登录
      console.log('已登录')
      var getUserInfo = await that.getUserInfo()
      wx.switchTab({
        url: '../index/index',
      })
    } else { // 未登录
      console.log('未登录')
      that.setData({
        isWaiting: false
      })
    }
  },

  // 登录成功=>跳转到index
  login: function(e) {
    var that = this
    return new Promise(function(resolve, reject) {
      if (e.detail.signature) {
        // console.log('[success] 授权成功')
        wx.login({
          success(res) {
            if (res.code) {
              wx.request({
                url: app.globalData.api_url + 'user/login',
                method: 'GET',
                data: {
                  appid: app.globalData.appid,
                  code: res.code,
                  signature: e.detail.signature,
                  rawData: e.detail.rawData,
                  encryptedData: e.detail.encryptedData,
                  iv: e.detail.iv
                },
                success(res) {
                  // console.log("[debug] ", res)
                  if (res.data.data) {
                    app.globalData.accessToken = res.data.data;
                    wx.setStorageSync('accessToken', res.data.data);
                    wx.setStorageSync('lastLoginTime', new Date());
                    console.log("[success] Login => AccessToken:", app.globalData.accessToken)
                    that.getUserInfo().then(res => {
                      wx.switchTab({
                        url: '../index/index',
                      })
                      resolve(true)
                    })
                  } else {
                    reject(1)
                  }
                },
                fail(err) {
                  reject(2)
                }
              })
            }
          }
        })
      } else {
        reject(false)
      }
    }).catch(err => {
      if (err == 1) console.log("[fail] AccessToken is null")
      else console.log('[fail] 授权失败')
      return false;
    })
  },

  // 每次登录获取新的token
  keepLogin: function() {
    return new Promise(function(resolve, reject) {
      wx.request({
        url: app.globalData.api_url + 'user/keepLogin',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        success(res) {
          console.log("[success] keepLogin ")
          if (res.data.data) {
            app.globalData.accessToken = res.data.data
            wx.setStorageSync('accessToken', res.data.data);
            wx.setStorageSync('lastLoginTime', new Date());
          }
          resolve(true)
        },
        fail(err) {
          reject(err)
        }
      })
    }).catch(err => {
      console.log("[fail] keepLogin: ", err)
      return false;
    })
  },

  // 微信自带检查授权
  onGetSetting: function() {
    return new Promise(function(resolve, reject) {
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // console.log("[success] getSetting: ", res)
            wx.getUserInfo({
              success(res) {
                console.log("[success] getSetting => getUserInfo")
                resolve(true)
              },
              fail(err) {
                reject(err)
              }
            })
          } else {
            reject(res)
          }
        }
      })
    }).catch(err => {
      console.log("[fail] getSetting: ", err)
      return false;
    })
  },

  // 服务器获取用户信息
  getUserInfo: function() {
    return new Promise(function(resolve, reject) {
      wx.request({
        url: app.globalData.api_url + 'user/getUserInfo',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        success(res) {
          if (res.data.ok) {
            console.log("[success] getUserInfo")
            app.globalData.userInfo = res.data.data
            // app.globalData.schoolId = res.data.data.schoolId
            app.globalData.open_id = res.data.data.openId
            app.globalData.school_id = res.data.data.schoolId
            resolve(true)
          }
        },
        fail(err) {
          reject(err)
        }
      })
    }).catch(err => {
      console.log("[fail] getUserInfo", err)
      return false;
    })
  },

  // 检查token是否过期
  isTokenValid: function() {
    var now = new Date()
    var last_login_time = wx.getStorageSync('lastLoginTime')
    var accessToken = wx.getStorageSync('accessToken')
    var t0 = Date.parse(last_login_time) / 1000
    var t1 = Date.parse(now) / 1000
    var lim = 86400 * 6 // 六天重新login
    var isTokenValid = (t0 != NaN && t0 + lim >= t1)
    if (isTokenValid) {
      app.globalData.accessToken = accessToken
    } else {
      wx.removeStorageSync('accessToken')
      wx.removeStorageSync('lastLoginTime')
    }
    return isTokenValid
  },
})