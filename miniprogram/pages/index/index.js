const app = getApp()
const gPostType = 0

Page({
  data: {
    
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "义捐活动"],
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    iconList: [{
      iconPath: "/images/index_icon/digital.png",
      goods_type: 2,
      name: '数码'
    }, {
      iconPath: "/images/index_icon/book.png",
      goods_type: 0,
      name: '二手书'
    }, {
      iconPath: "/images/index_icon/bicycle.png",
      goods_type: 1,
      name: '二手车'
    }, {
      iconPath: "/images/index_icon/appliances.png",
      goods_type: 3,
      name: '家电'
    }, {
      iconPath: "/images/index_icon/more.png",
      goods_type: 4,
      name: '其他'
    }, ],
    open_id: "",
    isHide: true,
    isWaiting: true,
    hasNewInfo: false,
    tabbar: {},

    keyWord: "",
    inputKeyWord: "",
    pageSize: 4,
    pageNum: 1,
    imageUrl: "",
    nowShowData: [],
    allData: [],
    //searchData: [],
    nickname: "",
    headPortraitUrl: "",
  },

  onLoad: function(options) { //初始化数据
    // console.log("index onLoad!")
    //跟改我们自定义导航栏样式，并真正的隐藏导航栏
    app.editTabbar()
    this.hidetabbar()
    var that = this
    this.setData({
      imageUrl: app.globalData.file_url,
    })

    setTimeout(function () {
      that.setData({
        isWaiting: false
      })
    }, 1500)
    this.pageInit()
    
  },
  hidetabbar() { //隐藏底部导航栏
    wx.hideTabBar({
      fail: function(res) {
        setTimeout(function() { // 做了个延时重试一次，作为保底。
          wx.hideTabBar()
        }, 50)
      }
    });
  },
  onShow: function() {
    this.judgeNewInfo() //show时判断是否有info
    this.setData({
      school_id: app.globalData.userInfo.schoolId

    })
  },
  onPullDownRefresh: function() { //---下拉刷新帖子，这只是刷新首页，即最新帖子，没有更新到app.globalData
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
  onReachBottom: function() {
    var that = this

    that.getData()    
  },
  /** pageInit */
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
  getData: async function() {
    var that = this
    let pageSize = that.data.pageSize

    await wx.request({
      url: app.globalData.api_url +'post/selectSecondHandList',
      method: 'GET',
      header: {
        'Authorization': 'Bearer ' + app.globalData.accessToken
      },
      data: {
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        keyword: that.data.keyWord
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

  /** 页面跳转 */
  selectGoodsType(e) {
    wx.navigateTo({
      url: '../product/home/home?goods_type=' + e.currentTarget.dataset.type,
    })
  },

  gotoDetail: function(event) { //点进帖子
    var post_id = event.currentTarget.dataset.url
    wx.navigateTo({
      url: '/pages/post-show/post-show?post_id=' + post_id,
    })
  },

  changeSchool: function(event) { //改变学校
    wx.navigateTo({
      url: '/pages/school/school',
    })
  },

  gotoMylogs() {
    wx.navigateTo({
      url: '/pages/mylogs/home/home',
    })
  },

  gotoMore() {
    wx.redirectTo({
      url: '/pages/more/more',
    })
  },
  /* 获取搜索框输入 */
  searchInput: function(e) {
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
  search: function() {
    var that = this
    // console.log("search: ", that.data.inputKeyWord)

    that.setData({
      keyWord: that.data.inputKeyWord,
      allData: [],
      pageNum: 1
    })
    that.getData()
  },
  judgeNewInfo: async function() { //判断是否有新消息
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
  },

  selectSchool: function() {
    wx.navigateTo({
      url: '../school/school',
    })
  },

})