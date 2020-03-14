// miniprogram/pages/activity/home/home.js
const app = getApp()
const gPostType = 3
import regeneratorRuntime from '../../../utils/regenerator-runtime/runtime.js';
Page({
  data: {
    page: 1,
    pageSize: 2,
    dataCount: 0,
    hasMoreData: true,
    postData: [],
    nowShowData: [],
    nickname: {},
    post_type:3,
  },

  onLoad: function(options) { //初始化数据
    var that = this
    this.pageInit()
  },

  onShow: function() {
    if (app.globalData.school_id && app.globalData.school_name) {
      this.setData({
        school_id: app.globalData.school_id,
        school_name: app.globalData.school_name,
      })
      this.schoolShowOnly()
    }
  },

  onReachBottom: function() {
    var that = this
    if (that.data.hasMoreData == true) {
      that.showPageData()
    } else {
      console.log("没有更多数据")
    }
  },
  onPullDownRefresh: function () {
    var that = this
    this.flushPost().then(res => {
      wx.stopPullDownRefresh()
      that.setData({
        postData: that.data.postData,
          page: 1, 
          hasMoreData: true
        })
        that.showPageData()
    })
  }, 
  flushPost: async function () { //帖子刷新
  
    var that = this
    const db = wx.cloud.database()
    var newPostData = []
    let sum, cnt = that.data.postData.length //一开始，跳过已经获取的数据
    await db.collection('Post').where({ //获取当前post_type的帖子总数
      post_type: that.data.post_type,
    }).count().then(res => {

      sum = res.total
    })
    while (cnt < sum) {
     
      console.log(that.data.post_type)
      await db.collection('Post').where({ //循环获取所有新的数据
        post_type: that.data.post_type,
      }).orderBy('post_id', 'asc').skip(cnt).get()
        .then(res => {
          newPostData = newPostData.concat(res.data)
        })
      cnt += 20 //当跳出循环后，比起真正的数据多出20
    }
    that.data.postData = newPostData.concat(that.data.postData) //最新的数据放到开始,这里不需要刷新页面，就不setData
    app.globalData.post[that.data.post_type] = app.globalData.post[that.data.post_type].concat(newPostData) 
    console.log("flushOK",newPostData)
    return new Promise(function (resolve, reject) {
      resolve('ok')
    })


  },

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
    let dataCount = that.data.postData.length

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
  gotoDetail: function(event) {
    var post_id = event.currentTarget.dataset.url
    console.log(post_id)
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

  schoolShowOnly: function() {
    var nowShowData = this.data.nowShowData
    var school_id = this.data.school_id
    for(let i=0; i<nowShowData.length; ++i) {
      if(school_id != 0 && nowShowData[i].school_id != school_id) {
        nowShowData[i].isHidden = true
      } else {
        nowShowData[i].isHidden = false
      }
    }
    this.setData({
      nowShowData: nowShowData
    })
  },

  search: function(e) {
    var that = this
    new Promise(function(resolve, reject) {
      var post = app.globalData.post[gPostType]
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
      console.log(res)
      that.setData({
        nowShowData: res //当前展示的数组
      })
    })
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
})