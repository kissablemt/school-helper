//app.js
let regeneratorRuntime = require("/utils/regenerator-runtime/runtime") //本地异步所需js
App({
  onLaunch: function () {
    // test
    this.globalData.userInfo = wx.getStorageSync('userInfo')
    this.globalData.accessToken = wx.getStorageSync('accessToken')
  },

  myRequest: function (parm) {
    var that = this
    var ret = {}

    return new Promise(function (resolve, reject) {
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

    }).catch(err => {
      ret.msg = `[uncaught] ${err} ${parm.name}`
      ret.error = err
      return ret
    })
  },

  // 不知道什么用
  editTabbar: function () {
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
    api_url: 'http://101.132.142.58:8080/api/',
    file_url: 'http://101.132.142.58:8888/',
    appid: 'wx5a9d74cc2a8cca3f',

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