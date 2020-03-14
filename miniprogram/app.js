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
    this.globalData = { //新增测试
      tabBar: {
        "backgroundColor": "#ffffff",
        "color": "#979795",
        "selectedColor": "#1c1c1b",
        "list": [
          {
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
    }
    
    //return
    this.onGetUserInfo().then(res => {
      /** 传参到授权页 */
      that.globalData.checked = true
      if (that.userInfoCallback) {
        console.log("userInfoCallback: Callback")
        that.userInfoCallback(true)
      }
      
      /** 获取帖子和昵称 */
      //return 
      that.init()
    })
  },

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
  onGetUserInfo: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      wx.getSetting({
        success: function(res) {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: function(res) {
                that.queryUserInfo().then(res => {
                  console.log("GetUserInfo: Done")
                  resolve("GetUserInfo: Done")
                }).then(res=>{

                })
              },
              fail: function(res) {
                reject("Cannot get setting")
              }
            })
          } else {
            reject("Cannot get setting")
          }
        }
      })
    }).catch(err => {
      console.log(err)
    })
  },

  queryUserInfo: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      wx.cloud.callFunction({
        name: 'login',
        data: {}
      }).then(res => {
        console.log("old:", res)
        that.globalData.userInfo = res.result //赋值到gloalData
        that.globalData.school_id = res.result.school_id
      }).then(res => {
        console.log("queryUserInfo: Done")
        resolve("queryUserInfo: Done")
      })
    })
  },

  /** initCallback */
  init: function() {
    var that = this
    return Promise.all([that.onGetAllPost(), that.onGetNickname()]).then(res => {
      that.globalData.initDone = true
      console.log("init: Done")
    }).then(res => {
      if (that.initCallback) {
        console.log("init: Callback")
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
        console.log("GetAllPost: Done")
        resolve("GetAllPost: Done")
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
        console.log("GetNickname: Done")
        resolve("GetNickname: Done")
      })
    })
  },

})