//app.js
let regeneratorRuntime = require("/utils/regenerator-runtime/runtime") //本地异步所需js
App({
  onLaunch: function(e) {
    // this.myRequest(null);
  },

  onShow: function() {
    // this.myRequest(null);
  },

  validate: async function() {
    return new Promise(function(resolve, reject) {
      setTimeout(function(){
        wx.navigateTo({
          url: '/pages/authorization/authorization',
          // events: {
          //   loginCallback: function (data) {
          //     console.log(data)
          //     resolve(true)
          //   }
          // }
        })
      }, 150)
      resolve(true)
    }).catch(err => {
      console.log(err)
    })
  },

  myRequest: async function(parm) {
    var that = this
    var is_og_valid = true
    var ret = {}

    if (parm.alert && !this.isTokenValid()) {//token缺失或过期
      is_og_valid = false
      await that.validate();
    }

    return new Promise(function(resolve, reject) {
      if (that.globalData.accessToken) {
        if(!is_og_valid) ret.reload = true;

        wx.request({
          url: that.globalData.api_url + parm.api,
          method: parm.method,
          header: {
            'Authorization': 'Bearer ' + that.globalData.accessToken,
          },
          data: parm.data,
          success(res) {
            switch (res.data.code) {
              case 200:
                ret.ok = true
                ret.msg = `[success] `
                break;
              case 401:
                ret.msg = `[permission denied] `
                break;
              case 500:
                ret.msg = `[fail] `
                break;
              case 555:
                ret.msg = `[system busy] `
                break;
              case 10001:
                ret.msg = `[verify fail]] `
                break;
            }
            ret.result = res
            ret.msg = `${ret.msg} ${parm.api} ${parm.name}`
            resolve(ret)

          },
          fail(res) {
            reject(res)
          }
        })
      } else {
        // console.log(`[info] ‘游客’尝试 ${parm.name}`)
        ret.ok = false
        ret.result = {}
        ret.msg = `[info] ‘游客’尝试 ${parm.name}`;
        resolve(ret)
      }
    }).catch(err => {
      ret.msg = `[uncaught] ${err} ${parm.name}`
      ret.error = err
      return ret
    })
  },

  // 服务器获取用户信息
  getUserInfo: function () {
    var app = this
    return new Promise(function (resolve, reject) {
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
            wx.setStorageSync("userInfo", res.data.data)
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
  isTokenValid: function () {
    var now = new Date()
    var last_login_time = wx.getStorageSync('lastLoginTime')
    var accessToken = wx.getStorageSync('accessToken')
    var t0 = Date.parse(last_login_time) / 1000
    var t1 = Date.parse(now) / 1000
    var lim = 86400 * 6 // 六天重新login
    var isTokenValid = (t0 != NaN && t0 + lim >= t1)
    if (isTokenValid) {
      this.globalData.accessToken = accessToken
    } else {
      this.globalData.accessToken = null
      wx.removeStorageSync('accessToken')
      wx.removeStorageSync('lastLoginTime')
    }
    return isTokenValid
  },

  // index调用
  editTabbar: function() {
    let tabbar = this.globalData.tabBar;
    let currentPages = getCurrentPages();
    let _this = currentPages[currentPages.length - 1];
    let pagePath = _this.route;
    (pagePath.indexOf('/') != 0) && (pagePath = '/' + pagePath);
    for (let i in tabbar.list) {
      tabbar.list[i].selected = false;
      (tabbar.list[i].pagePath == pagePath) && (tabbar.list[i].selected = true);
    }
    _this.setData({
      tabbar: tabbar
    });
  },

  globalData: {
    api_url: 'https://xiaozhu.aradise.cn/api/',
    file_url: 'http://101.132.142.58:8888/',
    appid: 'wx5a9d74cc2a8cca3f',
    accessToken: wx.getStorageSync("accessToken"),
    userInfo: wx.getStorageSync("userInfo"),

    tabBar: {
      "backgroundColor": "#ffffff",
      "color": "#979795",
      "selectedColor": "#1c1c1b",
      "list": [{
          "pagePath": "/pages/index/index",
          "iconPath": "icon/index.png",
          "selectedIconPath": "icon/index_green.png",
          "text": "首页"
        },
        {
          "pagePath": "/pages/publish/publish",
          "iconPath": "icon/publish.png",
          "isSpecial": true,
          "text": "发布"
        },
        {
          "pagePath": "/pages/more/more",
          "iconPath": "icon/more.png",
          "selectedIconPath": "icon/more_green.png",
          "text": "更多"
        }
      ]
    }
  },

})