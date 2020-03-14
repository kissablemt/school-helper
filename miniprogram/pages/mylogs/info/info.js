// miniprogram/pages/mylogs/info/info.js
const app = getApp()
Page({
  data: {
    isManaging: false,
    open_id: null,
    selectedCount: 0, //防止用户恶意点击删除按钮，调用云函数
    comment: [],
    isSelectAll: false,
    my_mess: []
  },

  onLoad: function(options) {
    Promise.all([this.pageInit(),this.init()]).then(value=>{
      console.log("value",value)
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  pageInit: function() {
    var that = this
    return new Promise((resolve, reject) => {
      if (app.globalData.initDone) {
        that.setData({
          open_id: app.globalData.userInfo.open_id,
        })
      } else {
        app.initCallback = res => {
          if (res) {
            that.setData({
              open_id: app.globalData.userInfo.open_id,
            })
          }
        }
      }
      resolve('pageinit OK')
    })
  },
  init: function() {
    
    return new Promise((resolve, reject) => {
     
      var that = this
      wx.cloud.callFunction({
        name: 'get_mess',
        data: {
          open_id: app.globalData.userInfo.open_id
        }
      }).then(res => {
        console.log(res)
        var comment = res.result.result
        var my_mess = res.result.my_mess
        for (let i = 0; i < comment.length; i++) {
          comment[i].selected = false
          if(my_mess[i][1] == 0){ //未读消息
            comment[i].isNewInfo = true
          }else{
            comment[i].isNewInfo = false
          }
        }
        that.setData({ //初始化评论 
          comment: comment
        })
        that.setData({
          my_mess: my_mess
        })

      })
      that.setData({ //初始化open_id
        open_id: app.globalData.userInfo.open_id
      })
      resolve('init')
    })
  },

  toggleManage: function(e) {
    var that = this
    that.setData({
      isManaging: that.data.isManaging == true ? false : true,
    })
  },

  toggleSelect: function(e) {
    var that = this
    var reply_id = e.currentTarget.dataset.reply_id
    var comment = that.data.comment
    var selectedCount = that.data.selectedCount
    for (let i = 0; i < comment.length; i++) {
      if (comment[i].reply_id == reply_id) {
        selectedCount += (comment[i].selected == false) ? 1 : -1 //更新被选择数量
        comment[i].selected = (comment[i].selected == false) ? true : false //switch selected  
        break;
      }
    }
    console.log("selectedCount:", selectedCount)
    that.setData({
      comment: comment,
      selectedCount: selectedCount
    })
  },
  toggleSelectAll: function() {
    var that = this
    var comment = that.data.comment
    var isSelectAll = that.data.isSelectAll
    var selectedCount = (isSelectAll == false) ? comment.length : 0 //上次是 没有选择全部，点击后选择全部
    for (var item of comment) {
      item.selected = (isSelectAll == false) ? true : false
    }
    that.setData({
      comment: comment,
      selectedCount: selectedCount,
      isSelectAll: (isSelectAll == false) ? true : false
    })
  },

  deleteSelected: function() { //基于多选

    if (this.data.selectedCount <= 0) { //如果没有selected的数据，退出函数
      return;
    }
    var that = this
    var open_id = that.data.open_id

    var comment = that.data.comment
    var my_mess = that.data.my_mess
    var restComment = [] //剩下的commet
    var resMess = []
    for (let i = 0; i < comment.length; i++) {
      if (comment[i].selected == false) {
        restComment.push(comment[i])
        resMess.push(my_mess[i]) //因为是按照顺序的
      }
    }
    that.setData({
      comment: restComment,
      my_mess: resMess,
      selectedCount: 0 //删除完选择的了
    })

    wx.cloud.callFunction({ //把不需要删除的数据，更新回去
      name: 'updateBy_id',
      data: {
        table: 'Message',
        id_name: 'open_id',
        id_value: open_id,
        mydata: {
          my_mess: resMess
        }
      }
    })

  },
  readAll: function() {

    var that = this
    var open_id = open_id
    var my_mess = that.data.my_mess
    var my_comment = that.data.comment
    var hasReadAll = true
    for (let item of my_mess) {
      if (item[1] == 0) { //未读变已读
        item[1] = 1
        hasReadAll = false;
      }
    }
    for (let item of my_comment){ //当前页，红点的标识
      item.isNewInfo = false
    } 
    if (hasReadAll == true) { //已经全读了
      return;
    }
    that.setData({
      my_mess: my_mess,
      comment: my_comment
    })
    //上个页面,以及index的红点去掉
    var pages = getCurrentPages()
    var prePage = pages[pages.length - 2]
    var index = pages[pages.length - 3]  //index
    index.setData({
      hasNewInfo:false
    })
    prePage.setData({
      hasNewInfo: false
    })
    
    wx.cloud.callFunction({ //把不需要删除的数据，更新回去
      name: 'updateBy_id',
      data: {
        table: 'Message',
        id_name: 'open_id',
        id_value: open_id,
        mydata: {
          my_mess: my_mess
        }
      }
    })
  },
  gotoPost: function(e) {
    var post_id = e.currentTarget.dataset.post_id
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + post_id,
    })
  },

})