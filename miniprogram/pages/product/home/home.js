// miniprogram/pages/product/home/home.js
import regeneratorRuntime from '../../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const gPostType = 0

Page({
  data: {
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "义捐活动"],
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    goods_type: 0,
    post_type: 0,
    current: "0",
    searchKey: "",

    postData: [],
    nowShowData: [],
    nickname: {}
  },

  onLoad: function(options) {
    var that = this
    if (options.goods_type != null) {
      console.log("goods_type", options.goods_type)
      this.setData({
        goods_type: options.goods_type
      })
    }
    this.pageInit()
    wx.setNavigationBarTitle({
      title: that.data.goods_type_text[that.data.goods_type] //页面标题为路由参数
    })
  },
  onPullDownRefresh: function() {

    var that = this

    that.flushPost().then(res => { //使用promise.all貌似会有同步问题
      return that.filter()
    }).then(res => {
      that.setData({
        postData: that.data.postData
      })
    })

    setTimeout(function() {
      wx.stopPullDownRefresh()
    }, 500)
  },
  flushPost: async function() { //帖子刷新
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
      await db.collection('Post').where({ //循环获取所有新的数据
          post_type: that.data.post_type,
        }).orderBy('post_id', 'asc').skip(cnt).get()
        .then(res => {
          newPostData = newPostData.concat(res.data)
          console.log("newPostData",newPostData)
        })
      cnt += 20 //当跳出循环后，比起真正的数据多出20
    }

    that.data.postData = newPostData.concat(that.data.postData) //最新的数据放到开始,这里不需要刷新页面，就不setData
    app.globalData.post[that.data.post_type] = app.globalData.post[that.data.post_type].concat(newPostData) 
    console.log("flushOK")
    return new Promise(function(resolve, reject) {
      resolve('ok') 
    })


  },

  onShow: function() {
    var that = this
    if (app.globalData.school_id) {

      that.setData({
        school_id: app.globalData.school_id,
      })
      that.filter().then(res => {

        that.setData({
          postData: that.data.postData
        })
      })
    }
  },

  onUnload: function() {
    var post = this.data.postData
    for (let i = 0; i < post.length; ++i) {
      post[i].raw = null
    }
  },

  pageInit: function() {
    var that = this
    return new Promise(function(resolve, reject) {
      if (app.globalData.initDone) {
        that.setData({
          nickname: app.globalData.nickname,
          postData: app.globalData.post[gPostType],
          school_id: app.globalData.school_id,
          open_id: app.globalData.userInfo.open_id,
        })
        that.filter().then(res => {
          that.setData({
            postData: that.data.postData
          })
        })
      } else {
        app.initCallback = res => {
          if (res) {
            that.setData({
              nickname: app.globalData.nickname,
              postData: app.globalData.post[gPostType],
              school_id: app.globalData.school_id,
              open_id: app.globalData.userInfo.open_id,
            })
            that.filter().then(res => {
              that.setData({
                postData: that.data.postData
              })
            })
          }
        }
      }
      resolve("pageInit: Done")
    })
  },

  handleChange: function({
    detail
  }) {
    // console.log("detail",detail)
    if (this.data.post_type.toString() == detail.key)
      return
    var that = this
    var post_type = 1 - this.data.post_type
    this.data.post_type = post_type
    this.data.postData = app.globalData.post[post_type]
    this.filter().then(res => {
      that.setData({
        nowShowData: that.data.postData,
        current: detail.key,
      })
      that.search({
        detail: {
          value: ''
        }
      })
    })
  },

  filter: function(reset) {
    var post = this.data.postData
    var pt = this.data.post_type
    var gt = this.data.goods_type
    var si = this.data.school_id
    return new Promise(function(resolve, reject) {
      if (reset == null) {
        for (let i = 0; i < post.length; ++i) {
          post[i].isHidden = false
          //console.log(post[i].post_type, post[i].goods_type, post[i].school_id)
          if (pt != null && post[i].post_type != pt) { //商品类型不相符
            post[i].isHidden = true
          }
          if (gt != null && post[i].goods_type != gt) { //商品类型不相符
            post[i].isHidden = true
          }
          /*
            @author 星星星
            @date 2019/5/15
            @description  之前数据库的Post数据，大部分school_id == 0 的 修改后数据库中的数据后ok
          */
          if (si != null && post[i].school_id != si) { //学校不相符    
            post[i].isHidden = true
          }
        }

        resolve("filter: Done")
      } else if (post) { //只有post就初始化
        for (let i = 0; i < post.length; ++i) {
          post[i].isHidden = false
        }
        resolve("filter: Done")
      }
    })
  },

  search: function(e) {
    var that = this
    this.setData({
      searchKey: e.detail.value
    })

    new Promise(function(resolve, reject) {
      var post = that.data.postData //当前展示的数组
      var s = e.detail.value.split(' ')
      if (s.length) { //有关键字
        for (let i = 0; i < post.length; ++i) {
          var isHidden = post[i].isHidden
          if (post[i].raw == null) {
            post[i].raw = post[i].isHidden
          } else {
            isHidden = post[i].raw
          }

          for (let j = 0; !isHidden && j < s.length; ++j) {
            if (post[i].headline.indexOf(s[j]) == -1) {
              isHidden = true
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
        postData: res //当前展示的数组
      })
      return res
    })
  },
  gotoMylogs: function() {
    wx.navigateTo({
      url: '/pages/mylogs/home/home',
    })
  },
  gotoDetail: function(event) {
    var post_id = event.currentTarget.dataset.url
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
  gotoPublish: function() {
    var that = this
    wx.navigateTo({
      url: '/pages/publish/publish?' + "post_type=" + that.data.post_type + "&goods_type=" + that.data.goods_type,
    })
  }

})