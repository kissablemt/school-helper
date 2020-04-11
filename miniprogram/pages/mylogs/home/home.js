//mylogs-home.js
//获取应用实例
const app = getApp()

Page({
  data: {
    /*名字模态框*/
    modelName: true,
    /*手机模态框*/
    modelContact: true,

    hasUserInfo: false,
    hasNewInfo: false,

    file_url: app.globalData.file_url,
    api_url: app.globalData.api_url,
  },

  debug: function() {
    wx.setStorageSync('userInfo', this.data.userInfo)
  },

  onLoad: function() {
    var that = this
    this.setData({ //获取globalData中的数据
      userInfo: app.globalData.userInfo,
      accessToken: app.globalData.accessToken,
    })
  },

  onShow: function() {
    this.judgeNewInfo();
  },

  updateUserInfo: function() {
    var that = this
    var parm = {
      api: '/user',
      method: 'PUT',
      data: that.data.userInfo,
      name: '(上传头像)',
      alert: true,
    }
    let ret = app.myRequest(parm);//警告
    return ret.then(ret => {
      if (ret.ok) {
        console.log("[success] updateUserInfo: ", res)
        resolve(true)
      }
    })
  },

  //更换头像  
  changeAvatar: function() {
    var that = this;
    var open_id = that.data.userInfo.openId;
    var og_avatar = that.data.headPortraitUrl
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认是二者都有
      sourceType: ['camera', 'album'], //可以指定来源是相机还是相册，默认是二者都有
      success: function(res) {
        var url = res.tempFilePaths[0]
        var type = url.substr(url.lastIndexOf('.') + 1)
        var base64Str = wx.getFileSystemManager().readFileSync(url, 'base64')
        var parm = {
          api: '/user/headPortrait',
          method: 'PUT',
          data: {
            "headPortrait": base64Str,
          },
          name: '(上传头像)',
          alert: true,
        }
        let myreq = app.myRequest(parm);//警告
        myreq.then(ret => {
          if (ret.ok) {
            that.data.userInfo.headPortraitUrl = ret.result.data.data
            that.setData({
              userInfo: that.data.userInfo
            })
            console.log("[success] changeAvatar")
          } else {
            var msg = ret.result.data.msg
            wx.showToast({
              title: msg,
              icon: 'none'
            })
            console.log(`[fail] changeAvatar: ${msg}`)
          }
          that.debug();
        })
      },
      fail(err) {
        console.log("[fail] changeAvatar: ", err)
      }
    })
  },

  //更改名字
  bindChangeName: function() {
    this.setData({
      modelName: false
    })
  },
  /*取消更改名字*/
  cancelName: function(e) {
    this.setData({
      modelName: true,
    })
  },
  //确认更改名字
  confirmName: function(e) {
    var that = this
    that.data.userInfo.nickname = e.detail.value.nickname
    this.setData({
      userInfo: that.data.userInfo,
      modelName: true,
    })
    that.updateUserInfo().then(res => {
      that.debug()
    })
  },


  // 修改联系方式
  bindChangeContact: function(e) {
    this.setData({
      modelContact: false
    })
  },
  cancelContact: function(e) {
    this.setData({
      modelContact: true,
    })
  },
  confirmContact: function(e) {
    var that = this
    var contactWay = e.detail.value.contactWay
    that.data.userInfo.contactWay = contactWay
    this.setData({
      userInfo: that.data.userInfo,
      modelContact: true,
    })
    that.updateUserInfo().then(res => {
      that.debug()
    })
  },


  judgeNewInfo: async function() { //判断是否有新消息
    var that = this
    var parm = {
      api: '/message/selectAll',
      method: 'GET',
      name: '(获取个人的所有消息)',
      alert: false,
    }

    var ret = await app.myRequest(parm);//无警告
    if (ret.ok) {
      var message = ret.result.data.data
      var hasNewInfo = false
      for (var item of message)
        if (item.status == 1) {
          hasNewInfo = true
          break;
        }
      that.setData({
        hasNewInfo: hasNewInfo,
      })
    } else {
      console.log(ret.msg)
    }
  },

  /*前往我的消息*/
  getInfo: function(e) {
    wx.navigateTo({
      url: '../info/info',
    })
  },
  /*前往发布的帖子*/
  getPost: function(e) {
    wx.navigateTo({
      url: '../post/post',
    })
  },
  /*前往收藏的帖子*/
  getFavorite: function(e) {
    wx.navigateTo({
      url: '../favorite/favorite',
    })
  },

  bindGetUserInfo: function(e) {
    console.log(e.detail.userInfo)
  }

})