// miniprogram/pages/mylogs/info/info.js
const app = getApp()
const utils = require("../../../utils/util.js")

Page({
  data: {
    message: [], // 包括是否被选择（selected字段）
    isManaging: false, //管理与完成按钮切换
    selectCount: 0,

    file_url: app.globalData.file_url,
  },
  onLoad: function(options) {},

  onShow: function() {
    this.onGetMessage();
  },

  async onGetMessage() {
    var that = this
    var parm = {
      api: '/message/selectAll',
      method: 'GET',
      name: '(获取个人的所有消息)',
    }

    var ret = await app.myRequest(parm)
    if (ret.ok) {
      console.log(ret.msg, ret.result.data.data)
      var message = ret.result.data.data
      for (var item of message) item.date = utils.formatTime(new Date(item.date)).substr(0, 10)
      that.setData({
        message: message,
      })
    } else {
      console.log(ret.msg)
    }
  },

  toggleManage: function(e) {
    var that = this
    that.setData({
      isManaging: that.data.isManaging == true ? false : true,
    })
  },

  toggleSelect: function(e) {
    var index = e.currentTarget.dataset.index
    var message = this.data.message
    var selectCount = this.data.selectCount
    message[index].selected = (!message[index].selected) ? true : false //switch selected
    selectCount += (message[index].selected) ? +1 : -1
    this.setData({
      message: message,
      selectCount: selectCount,
    })
  },

  toggleSelectAll: function() {
    var that = this
    var message = that.data.message
    var selectCount = that.data.selectCount
    var totalCount = message.length

    // 已‘全选’则全部不选，否则全部选择
    if (selectCount == totalCount) {
      for (var item of message) item.selected = false
      selectCount = 0
    } else {
      for (var item of message) item.selected = true
      selectCount = totalCount
    }

    that.setData({
      message: message,
      selectCount: selectCount,
    })
  },

  readAll: function() {
    var that = this
    var message = that.data.message
    var delPromise = []
    for (var item of message) {
      var parm = {
        api: `/message/read/${item.messageId}`,
        method: 'PUT',
        name: `(已读消息${item.messageId})`,
      }
      delPromise.push(app.myRequest(parm))
    }

    Promise.all(delPromise).then(res => {
      wx.showToast({
        title: '全读成功',
      })
      console.log("[success] readAll")
      that.onGetMessage();
    }).catch(err => {
      console.log("[fail] readAll : ", err)
    })
  },

  deleteSelected: function() {
    var that = this
    if (that.data.selectCount) {
      wx.showModal({
        title: '删除消息',
        content: '确定删除吗？',
        success(res) {
          if (res.confirm) {
            var message = that.data.message
            var delPromise = []
            for (var item of message) {
              if (item.selected) {
                var parm = {
                  api: `/message/${item.messageId}`,
                  method: 'DELETE',
                  name: `(删除消息${item.messageId})`,
                }
                delPromise.push(app.myRequest(parm))
              }
            }

            Promise.all(delPromise).then(res => {
              wx.showToast({
                title: '删除成功',
              })
              console.log("[success] deleteSelected")
              that.onGetMessage();
            }).catch(err => {
              console.log("[fail] deleteSelected : ", err)
            })
          }
        }
      })

    } else {
      wx.showToast({
        title: '请选择要删除的收藏',
        icon: 'none',
      })
    }
  },

  gotoPost: function(e) {
    var post_id = e.currentTarget.dataset.post_id
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + post_id,
    })
  },
})