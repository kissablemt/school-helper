//app.js
let regeneratorRuntime = require("/utils/regenerator-runtime/runtime") //本地异步所需js
App({
  onLaunch: function() {

    var that = this
    // if (!wx.cloud) {
    //   console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    // } else {
    //   wx.cloud.init({
    //     traceUser: true,
    //   })
    // }
  },

  // 不知道什么用
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