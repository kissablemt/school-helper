// miniprogram/pages/mylogs/post/post.js
const app = getApp()
const utils = require("../../../utils/util.js")

Page({
  data: {
    post: [], // 包括是否被选择（selected字段）
    isManaging: false, //管理与完成按钮切换
    selectCount: 0,

    file_url: app.globalData.file_url,
  },

  onLoad: function (options) { },

  onShow: function () {
    this.onGetPost();
  },

  async onGetPost() {
    var that = this
    var parm = {
      api: '/post/selectAll',
      method: 'GET',
      name: '(获取用户发布的帖子)',
      alert: true,
    }

    var ret = await app.myRequest(parm);//警告
    if (ret.ok) {
      console.log(ret.msg, ret.result)
      var post = ret.result.data.data
      post.reverse()
      for (var item of post) item.date = utils.formatTime(new Date(item.date)).substr(0, 10)
      that.setData({
        post: post,
      })
    } else {
      console.log(ret.msg)
    }
  },

  toggleManage: function (e) {
    var that = this
    that.setData({
      isManaging: that.data.isManaging == true ? false : true,
    })
  },

  toggleSelect: function (e) {
    var index = e.currentTarget.dataset.index
    var post = this.data.post
    var selectCount = this.data.selectCount
    post[index].selected = (!post[index].selected) ? true : false //switch selected
    selectCount += (post[index].selected) ? +1 : -1
    this.setData({
      post: post,
      selectCount: selectCount,
    })
  },

  toggleSelectAll: function () {
    var that = this
    var post = that.data.post
    var selectCount = that.data.selectCount
    var totalCount = post.length

    // 已‘全选’则全部不选，否则全部选择
    if (selectCount == totalCount) {
      for (var item of post) item.selected = false
      selectCount = 0
    } else {
      for (var item of post) item.selected = true
      selectCount = totalCount
    }

    that.setData({
      post: post,
      selectCount: selectCount,
    })
  },

  deleteSelected: function () {
    var that = this
    if (that.data.selectCount) {
      wx.showModal({
        title: '删除收藏',
        content: '确定删除吗？',
        success(res) {
          if (res.confirm) {
            var post = that.data.post
            var delPromise = []
            for (var item of post) {
              if (item.selected) {
                var parm = {
                  api: `/post/${item.postId}`,
                  method: 'DELETE',
                  name: `(删除帖子${item.postId})`,
                  alert: true,
                }
                let tmp = app.myRequest(parm);//警告
                delPromise.push(tmp)
              }
            }

            Promise.all(delPromise).then(res => {
              wx.showToast({
                title: '删除成功',
              })
              console.log("[success] deleteSelected")
              that.onGetPost();
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

  gotoPost: function (e) {
    var postId = e.currentTarget.dataset.post_id
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + postId,
    })
  },
})