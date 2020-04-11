// miniprogram/pages/mylogs/favorite/favorite.js
const app = getApp()
const utils = require("../../../utils/util.js")

Page({
  data: {
    collection: [], // 包括是否被选择（selected字段）
    isManaging: false, //管理与完成按钮切换
    selectCount: 0,

    file_url: app.globalData.file_url,
  },

  onLoad: function(options) {},

  onShow: function() {
    this.onGetCollection();
  },

  async onGetCollection() {
    var that = this
    var parm = {
      api: '/collection/selectAll',
      method: 'GET',
      name: '(获取个人的所有收藏)',
      alert: false,
    }

    var ret = await app.myRequest(parm);//无警告
    if (ret.ok) {
      console.log(ret.msg, ret.result)
      var collection = ret.result.data.data
      collection.reverse()
      for (var item of collection) item.date = utils.formatTime(new Date(item.date)).substr(0, 10)
      that.setData({
        collection: collection,
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
    var collection = this.data.collection
    var selectCount = this.data.selectCount
    collection[index].selected = (!collection[index].selected) ? true : false //switch selected
    selectCount += (collection[index].selected) ? +1 : -1
    this.setData({
      collection: collection,
      selectCount: selectCount,
    })
  },

  toggleSelectAll: function() {
    var that = this
    var collection = that.data.collection
    var selectCount = that.data.selectCount
    var totalCount = collection.length

    // 已‘全选’则全部不选，否则全部选择
    if (selectCount == totalCount) {
      for (var item of collection) item.selected = false
      selectCount = 0
    } else {
      for (var item of collection) item.selected = true
      selectCount = totalCount
    }

    that.setData({
      collection: collection,
      selectCount: selectCount,
    })
  },

  deleteSelected: function() {
    var that = this
    if (that.data.selectCount) {
      wx.showModal({
        title: '删除收藏',
        content: '确定删除吗？',
        success(res) {
          if (res.confirm) {
            var collection = that.data.collection
            var delPromise = []
            for (var item of collection) {
              if (item.selected) {
                var parm = {
                  api: `/collection/${item.collectionId}`,
                  method: 'DELETE',
                  name: `(删除帖子${item.collectionId}收藏)`,
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
              that.onGetCollection();
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
    var postId = e.currentTarget.dataset.post_id
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + postId,
    })
  },
})