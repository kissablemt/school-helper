// miniprogram/pages/authorization/authorization.js
const app = getApp()

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isWaiting: true,
  },

  onLoad: function(options) {
    var that = this
    if (app.globalData.checked) {
      if (app.globalData.userInfo) {
        wx.switchTab({
          url: '../index/index',
        })
      } else {
        that.setData({
          isWaiting: false
        })
      }
    } else {
      app.userInfoCallback = res => {
        if (res && app.globalData.userInfo) {
          wx.switchTab({
            url: '../index/index',
          })
        } else {
          that.setData({
            isWaiting: false
          })
        }
      }
    }
  },
  /**获取授权 */
  bindGetUserInfo: function(e) {
    const db = wx.cloud.database()
    console.log("user authorize:", e)
    if (e.detail.userInfo) {
      var that = this;
      wx.cloud.callFunction({
        name: 'login',
        data: {
          nickname: e.detail.userInfo.nickName,
        }
      }).then(res => {
        console.log("new:", res)
        app.globalData.userInfo = res.result //赋值到gloalData 
        app.globalData.school_id = res.result.school_id
        const open_id = res.result.open_id
        if (res.result.notExistUser == true) {
          wx.downloadFile({ //下载网络上的图片下来 
            url: e.detail.userInfo.avatarUrl,
            success(res) {
              if (res.statusCode === 200) {
                new Promise(function(resolve, reject) {
                  wx.cloud.uploadFile({
                    cloudPath: 'avatar/' + open_id + '.jpg',
                    filePath: res.tempFilePath,
                    success: function(res) { //上传图片成功
                      setTimeout(function() {
                        wx.switchTab({
                          url: '../index/index',
                        })
                      }, 1000)
                    }
                  })
                  resolve("OK")
                })
              }
            }
          })
        } else {
          setTimeout(function () {
            wx.switchTab({
              url: '../index/index',
            })
          }, 1000)
        }
      })
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击了“返回授权”')
          }
        }
      })
    }
  },
})