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

  debug: function () {
    wx.setStorageSync('userInfo', this.data.userInfo)
  },

  onLoad: function () {
    var that = this
    this.setData({ //获取globalData中的数据
      userInfo: app.globalData.userInfo,
      accessToken: app.globalData.accessToken,
    })
  },

  updateUserInfo: function () {
    var that = this
    return new Promise(function (resolve, reject) {
      wx.request({
        url: app.globalData.api_url + 'user',
        method: 'PUT',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: that.data.userInfo,
        success(res) {
          if (res.data.ok) {
            console.log("[success] updateUserInfo: ", res)
            resolve(true)
          }
        }
      })
    })
  },

  //更换头像  
  changeAvatar: function () {
    var that = this;
    var open_id = that.data.userInfo.openId;
    var og_avatar = that.data.headPortraitUrl
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认是二者都有
      sourceType: ['camera', 'album'], //可以指定来源是相机还是相册，默认是二者都有
      success: function (res) {
        var url = res.tempFilePaths[0]
        var type = url.substr(url.lastIndexOf('.') + 1)
        that.base64(url, type).then(res => {
          var base64Str = res
          wx.request({
            url: app.globalData.api_url + 'user/headPortrait',
            method: 'PUT',
            header: {
              'Authorization': 'Bearer ' + app.globalData.accessToken
            },
            data: {
              "headPortrait": base64Str
            },
            success(res) {
              if (res.data.code == 200) {
                that.data.userInfo.headPortraitUrl = res.data.data
                that.setData({
                  userInfo: that.data.userInfo
                })
                console.log("[success] changeAvatar")
              } else if (res.data.code == 500) {
                wx.showToast({
                  title: '图片内容涉嫌违规',
                  icon: 'none'
                })
                console.log("[fail] changeAvatar: 含有敏感照片")
              } else { }

              that.debug()
            }
          })
        })
      },
    })
  },
  base64(url, type) {
    return new Promise((resolve, rejiect) => {
      wx.request({
        url: url,
        responseType: 'arraybuffer',
        success: res => {
          let base64Url = wx.arrayBufferToBase64(res.data); //把arraybuffer转成base64
          resolve(base64Url)
        }
      });
    })
  },

  //更改名字
  bindChangeName: function () {
    this.setData({
      modelName: false
    })
  },
  /*取消更改名字*/
  cancelName: function (e) {
    this.setData({
      modelName: true,
    })
  },
  //确认更改名字
  confirmName: function (e) {
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
  bindChangeContact: function (e) {
    this.setData({
      modelContact: false
    })
  },
  cancelContact: function (e) {
    this.setData({
      modelContact: true,
    })
  },
  confirmContact: function (e) {
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


  judgeNewInfo: function () { //判断是否有新消息
    var that = this
    const db = wx.cloud.database()
    db.collection('Message').where({
      open_id: that.data.userInfo.open_id
    }).get().then(res => {
      // console.log("res", res)
      let infos = res.data[0].my_mess
      for (let data of infos) {
        if (data[1] == 0) { //有新的info
          that.setData({
            hasNewInfo: true,
          })
          break
        }
      }
    })
  },

  /*前往我的消息*/
  getInfo: function (e) {
    wx.navigateTo({
      url: '../info/info',
    })
  },
  /*前往发布的帖子*/
  getPost: function (e) {
    wx.navigateTo({
      url: '../post/post',
    })
  },
  /*前往收藏的帖子*/
  getFavorite: function (e) {
    wx.navigateTo({
      url: '../favorite/favorite',
    })
  },

  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
  }

})