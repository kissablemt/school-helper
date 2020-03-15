//app.js
let regeneratorRuntime = require("/utils/regenerator-runtime/runtime") //本地异步所需js
App({
  onLaunch: function() {

    var that = this
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    /** 获取帖子和昵称 */
    that.init()
  },

  /** initCallback */
  init: function() {
    var that = this
    return Promise.all([that.onGetAllPost(), that.onGetNickname()]).then(res => {
      that.globalData.initDone = true
      console.log("[success] init")
    }).then(res => {
      if (that.initCallback) {
        console.log("[callback] init")
        that.initCallback(true)
      }
    })
  },

  onGetAllPost: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      wx.cloud.callFunction({
        name: 'get_all_records',
        data: {
          table: 'Post'
        }
      }).then(res => {
        //post_type{ 0: 二手商品，1：二手商品求购，2：失物招领，3：义捐活动}
        var post = [
          [],
          [],
          [],
          []
        ]
        let data = res.result
        for (let i = 0; i < data.length; ++i) {
          post[data[i].post_type].push(data[i]);
        }
        for (let i = 0; i < 4; ++i) {
          post[i].reverse()
        }
        that.globalData.post = post
        console.log("[success] GetAllPost")
        resolve(true)
      })
    })
  },

  onGetNickname: function() {
    var that = this
    var nickname = {}
    return new Promise(function(resolve, reject) {
      wx.cloud.callFunction({
        name: 'get_all_records',
        data: {
          table: 'User'
        }
      }).then(res => {
        let len = res.result.length
        let data = res.result
        for (let i = 0; i < len; ++i)
          nickname[data[i].open_id] = data[i].nickname
        that.globalData.nickname = nickname
        console.log("[success] GetNickname")
        resolve(true)
      })
    })
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