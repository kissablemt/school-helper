// miniprogram/pages/activity/home/home.js
const app = getApp()
const gPostType = 3
import regeneratorRuntime from '../../../utils/regenerator-runtime/runtime.js';
Page({
  data: {
    nickname: "",
    post_type: 3,
    goods_type: 0,
    isWaiting: true,
    open_id: "",
    keyWord: "",
    inputKeyWord: "",
    pageSize: 3,
    pageNum: 1,
    imageUrl: "",
    nowShowData: [],
    allData: [],
    //searchData: [],
    nickname: "",
    headPortraitUrl: "",
    hasNewInfo: false,
  },

  onLoad: function(options) { //初始化数据
    var that = this

    this.setData({
      imageUrl: app.globalData.file_url
    })
    setTimeout(function () {
      that.setData({
        isWaiting: false
      })
    }, 1500)
    this.pageInit()
  },

  onShow: function() {
    this.judgeNewInfo() //show时判断是否有info
    if (app.globalData.userInfo.schoolId) {
      this.setData({
        school_id: app.globalData.userInfo.schoolId
      })
    }
  },

  onReachBottom: function() {
    var that = this
    that.getData()  
  },
  onPullDownRefresh: function () {
    var that = this
    if (!that.data.keyWord.length) {
      that.setData({
        pageNum: 1,
        allData: []
      })
      that.getData()
    }

    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500)
  }, 
  pageInit: function() {
    var that = this
    
    // console.log('pageInit')
    that.setData({
      imageUrl: app.globalData.file_url,
      nickname: app.globalData.userInfo.nickname,
      schoolId: app.globalData.userInfo.schoolId,
      open_id: app.globalData.userInfo.openId,
      headPortraitUrl: app.globalData.userInfo.headPortraitUrl
    })
    that.getData()
    
  },
  // 获取数据
  getData: async function () {
    var that = this
    let pageSize = that.data.pageSize

    await wx.request({
      url: app.globalData.api_url + 'post/selectList',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      data: {
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        keyword: that.data.keyWord,
        postType: parseInt(that.data.post_type + 1)
      },
      success(res) {
        // console.log('getpostdata success!')
        // console.log(res.data)
        if (res.data.code == 200) {
          if (res.data.data && res.data.data.length) {
            that.setData({
              allData: that.data.allData.concat(res.data.data),
              pageNum: that.data.pageNum + 1,
              nowShowData: that.data.allData.concat(res.data.data)
            })
          } else {
            wx.showToast({
              title: '找不到相关产品'
            })
          }
        }
      }, fail(msg) {
        // console.log(msg)
      }
    })
  },
  gotoDetail: function(event) {
    var post_id = event.currentTarget.dataset.url
    // console.log(post_id)
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + post_id,
    })
  },
  // 更换学校
  selectSchool: function() {
    wx.navigateTo({
      url: '/pages/school/school',
    })
  },
  /* 获取搜索框输入 */
  searchInput: function (e) {
    // console.log(e.detail.value)
    if (e.detail.value) {
      this.setData({
        inputKeyWord: e.detail.value
      })
    } else {
      this.setData({
        keyWord: "",
        inputKeyWord: e.detail.value
      })
    }

  },
  /** 搜索 */
  search: function () {
    var that = this
    // console.log("search: ", that.data.inputKeyWord)

    that.setData({
      keyWord: that.data.inputKeyWord,
      allData: [],
      pageNum: 1
    })
    that.getData()
  },
  gotoPublish: function () {
    var that = this
    wx.navigateTo({
      url: '/pages/publish/publish?' + "post_type=" + that.data.post_type + "&goods_type=" + that.data.goods_type,
    })
  },gotoMylogs: function () {
    wx.navigateTo({
      url: '/pages/mylogs/home/home',
    })
  },
  judgeNewInfo: async function () { //判断是否有新消息
    var that = this

    await wx.request({
      url: app.globalData.api_url + 'message/selectAll',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      success(res) {
        // console.log('getMessage success!')
        // console.log(res.data)
        if (res.data.code == 200) {
          for (let i = 0; i < res.data.data.length; ++i) {
            if (res.data.data[i].status == 1) {
              that.setData({
                hasNewInfo: true,
              })
              break;
            }
          }
        }
      }, fail(msg) {
        console.log(msg)
      }
    })
  }
})