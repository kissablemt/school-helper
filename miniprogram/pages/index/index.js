
const app = getApp()
const gPostType = 0

Page({
  data: {
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "义捐活动"],
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    iconList: [{
      iconPath:"/images/index_icon/digital.png",
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

    page: 1,
    pageSize: 6,
    showDataCount: 20, //首页最多show 10 条
    hasMoreData: true,

    postData: [],
    nowShowData: [],
    nickname: {},

    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: true,
    isWaiting: true,

    tabbar:{},
  },

  onLoad: function(options) { //初始化数据
  //跟改我们自定义导航栏样式，并真正的隐藏导航栏
    app.editTabbar() 
    this.hidetabbar()
    
    var that = this  
    setTimeout(function() {
      that.setData({
        isWaiting: false
      })
    }, 1500)
    this.pageInit()
    
  }, 
  hidetabbar() {//隐藏底部导航栏
    wx.hideTabBar({
      fail: function (res) {
        setTimeout(function () { // 做了个延时重试一次，作为保底。
          wx.hideTabBar()
        }, 500)
      }
    });
  },
  onShow: function() {
    this.judgeNewInfo() //show时判断是否有info
    this.setData({
      school_id: app.globalData.school_id
    })
  },
  onPullDownRefresh: function() { //---下拉刷新帖子，这只是刷新首页，即最新帖子，没有更新到app.globalData
    var that = this

    const db = wx.cloud.database()
    db.collection('Post').where({
        post_type: 0
      }).orderBy('post_id', 'desc').limit(that.data.showDataCount) 
      .get()
      .then(res => { 
        // console.log("res", res) 
        that.setData({
          postData: res.data, 
          page: 1,
          hasMoreData: true 
        })
        that.showPageData()
      })
      .catch(console.error)

    setTimeout(function() {
      wx.stopPullDownRefresh()
    }, 500)
  },
  onReachBottom: function() {
    var that = this
    if (that.data.hasMoreData == true) {
      that.showPageData()
    } else {
      console.log("没有更多数据")
    }
  },
  /** pageInit */
  pageInit: function() {
    var that = this
    if (app.globalData.initDone) {
      that.setData({
        nickname: app.globalData.nickname,
        postData: app.globalData.post[gPostType],
        school_id: app.globalData.school_id,
        open_id: app.globalData.userInfo.open_id,
      })
      that.showPageData()
    } else {
      app.initCallback = res => {
        if (res) {
          that.setData({
            nickname: app.globalData.nickname,
            postData: app.globalData.post[gPostType],
            school_id: app.globalData.school_id,
            open_id: app.globalData.userInfo.open_id,
          })
          that.showPageData()
        }
      }
    }
  },

  // 展示新页面
  showPageData: function() {
    var that = this
    let page = that.data.page - 1
    let pageSize = that.data.pageSize
    let dataCount = that.data.showDataCount

    that.setData({
      nickname: that.data.nickname,
      nowShowData: that.data.postData.slice(0, (page + 1) * pageSize)
    })
    if (dataCount / pageSize - 1 > page) { /*总页数小于当前页*/
      that.data.hasMoreData = true
    } else {
      that.data.hasMoreData = false
    }
    that.data.page += 1
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

  /** 搜索 */
  search: function(e) {
    var that = this
    new Promise(function(resolve, reject) {
      var post = that.data.postData //当前展示的数组
      var s = e.detail.value.split(' ')
      if (s.length) { //有关键字
        for (let i = 0; i < post.length; ++i) {
          if (post[i].raw == null) {
            post[i].raw = post[i].isHidden
          }
          var isHidden = false
          for (let j = 0; j < s.length; ++j) {
            if (post[i].headline.indexOf(s[j]) == -1) {
              isHidden = true
              break
            }
          }
          post[i].isHidden = isHidden
        }
      } else {
        for (let i = 0; i < post.length; ++i) {
          if (post[i].raw != null) {
            post[i].isHidden = post[i].raw
          }
        }
      }
      resolve(post)
    }).then(res => {
      that.setData({
        nowShowData: res //当前展示的数组
      })
    })
  },
   judgeNewInfo: function () {//判断是否有新消息
    var that = this
    const db = wx.cloud.database()
    db.collection('Message').where({
      open_id: app.globalData.userInfo.open_id
    }).get().then(res => {
      // console.log("res",res)
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

  selectSchool: function() {
    wx.navigateTo({
      url: '../school/school',
    })
  },

  getMylogs: function() {
    wx.navigateTo({
      url: '../mylogs/home/home',
    })
  },
  

})