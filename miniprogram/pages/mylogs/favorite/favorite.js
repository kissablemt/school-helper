// miniprogram/pages/mylogs/favorite/favorite.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    open_id: null, //测试 
    collection: [],            // 包括是否被选择（selected字段）
    postData: [],
    selectedCount: 0,          //防止用户恶意点击删除按钮，调用云函数
    isManaging: false, //管理与完成按钮切换
    isSelectAll: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    Promise.all([this.pageInit(), this.getMsg()]).then(value => {
      console.log("value:", value)
    })
    //需要获取open_id，用于获取收藏于更新收藏

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  pageInit: function () {
    var that = this
    return new Promise((resolve, reject) => {

      if (app.globalData.initDone) {
        that.setData({
          nickname: app.globalData.nickname,
          postData: app.globalData.post,
          // school_id: app.globalData.school_id,
          open_id: app.globalData.userInfo.open_id,
        })
        // that.showPageData()
      } else {
        app.initCallback = res => {
          if (res) {
            that.setData({
              nickname: app.globalData.nickname,
              postData: app.globalData.post,
              // school_id: app.globalData.school_id,
              open_id: app.globalData.userInfo.open_id,
            })
            // that.showPageData()
          }
        }
      }
      resolve('pageinit OK')
    })
  },
  getMsg: function () {
 
    var that = this
    const db = wx.cloud.database()
    return new Promise((resolve, reject) => {


      db.collection('Message').where({
        open_id: that.data.open_id
      }).get().then(res => {

        var collectionData = []
        var postData = that.data.postData
        var nickname = that.data.nickname
        for (let i = 0; i < postData.length; i++) {
          for (let j = 0; j < postData[i].length; j++) { //遍历所有数据
            for (let k = 0; k < res.data[0].my_collection.length; k++) { //获取collection中的数据
              if (postData[i][j].post_id == res.data[0].my_collection[k]) {
                var data = postData[i][j]
                data['nickname'] = nickname[data.open_id]
                data['selected'] = false     //初始化选择框的属性
                collectionData.push(data)
              }
            }
          }
        }
        that.setData({
          collection: collectionData
        })
        return resolve('get Collection ok')
      })
    })
  },
  toggleManage: function (e) {
    var that = this
    that.setData({
      isManaging: that.data.isManaging == true ? false : true,
    })
  },

  toggleSelect: function (e) {
    var that = this
    var post_id = e.currentTarget.dataset.post_id
    var collection = that.data.collection
    var selectedCount = that.data.selectedCount
    for (let i = 0; i < collection.length; i++) {
      if (collection[i].post_id == post_id) {
        selectedCount += (collection[i].selected == false) ? 1 : -1             //更新被选择数量
        collection[i].selected = (collection[i].selected == false) ? true : false   //switch selected  
        break;
      }
    }
    console.log("selectedCount:", selectedCount)
    that.setData({
      collection: collection,
      selectedCount: selectedCount
    })
  },
  toggleSelectAll: function () {
    var that = this
    var collection = that.data.collection
    var isSelectAll = that.data.isSelectAll
    var selectedCount = (isSelectAll == false) ? collection.length : 0  //上次是 没有选择全部，点击后选择全部
    for (var item of collection) {
      item.selected = (isSelectAll == false) ? true : false
    }
    that.setData({
      collection: collection,
      selectedCount: selectedCount,
      isSelectAll: (isSelectAll == false) ? true : false
    })
  },

  deleteSelected: function () {//基于多选

    if (this.data.selectedCount <= 0) { //如果没有selected的数据，退出函数
      return;
    }

    var that = this
    var open_id = that.data.open_id
    var collection = that.data.collection
    var restCollection = []          //剩下的collection
    var restPost_id = []
    for (var item of collection) { 
      if (item.selected == false) {//需要留下的
        restCollection.push(item)
        restPost_id.push(item.post_id)
      }
    }
    that.setData({
      collection: restCollection,
      selectedCount: 0  //删除完选择的了
    })
    wx.cloud.callFunction({ //把不需要删除的数据，更新回去
      name: 'updateBy_id',
      data: {
        table: 'Message',
        id_name: 'open_id',
        id_value: open_id,
        mydata: {
          my_collection: restPost_id
        }
      }
    })

  },
  gotoPost:function(e){
    var post_id = e.currentTarget.dataset.post_id
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + post_id,
    })
  },
})