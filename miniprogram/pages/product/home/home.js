// miniprogram/pages/product/home/home.js
import regeneratorRuntime from '../../../utils/regenerator-runtime/runtime.js';
const app = getApp()
//const gPostType = 0

Page({
  data: {
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "义捐活动"],
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    goods_type: 0,
    post_type: 0,
    current: "0",
    open_id: "",
    school_id: "",
    isWaiting: true,
    hasNewInfo: false,

    keyWord: "",
    inputKeyWord: "",
    allData: [],
    pageSize: 6,
    pageNum: 1,
    imageUrl: "",
    nowShowData: [],
    nickname: "",
    headPortraitUrl: "",
    gPostType: 0
  },

  onLoad: function(options) {
    var that = this
    if (options.goods_type != null) {
      // console.log("goods_type", options.goods_type)
      this.setData({
        imageUrl: app.globalData.file_url,
        goods_type: parseInt(options.goods_type)
      })
    }

    wx.setNavigationBarTitle({
      title: that.data.goods_type_text[that.data.goods_type] //页面标题为路由参数
    })
    this.pageInit()
    setTimeout(function() {
      that.setData({
        isWaiting: false
      })
    }, 1500)
  },
  onPullDownRefresh: function() {
    var that = this
    // console.log("onPullDownRefresh")
    if (!that.data.keyWord.length) {
      that.setData({
        pageNum: 1,
        allData: []
      })
      that.getData()
    }
    setTimeout(function() {
      wx.stopPullDownRefresh()
    }, 500)
  },
  onReachBottom: function() {
    var that = this

    // console.log("onReachBottom")
    that.getData()
  },
  // 获取数据
  getData: async function() {
    var that = this
    let pageSize = that.data.pageSize

    // console.log("goodsType:", parseInt(that.data.goods_type)+1)
    // console.log("postType:", parseInt(that.data.gPostType)+1)
    await wx.request({//游客
      url: app.globalData.api_url + 'post/selectList',
      method: 'GET',
      data: {
        goodsType: parseInt(that.data.goods_type) + 1,
        postType: parseInt(that.data.gPostType) + 1,
        pageNum: that.data.pageNum,
        pageSize: that.data.pageSize,
        keyword: that.data.keyWord
      },
      success(res) {
        // console.log('getpostdata success!')
        // console.log(res.data)
        if (res.data.code == 200) {
          if (res.data.data.length) {
            that.setData({
              allData: that.data.allData.concat(res.data.data),
              pageNum: parseInt(that.data.pageNum) + 1,
              nowShowData: that.data.allData.concat(res.data.data),
            })
          } else {
            wx.showToast({
              title: '找不到相关产品'
            })
          }
        }

      },
      fail(msg) {
        // console.log(msg)
      }
    })
  },
  onShow: function() {
    var that = this
    this.judgeNewInfo() //show时判断是否有info
    if (app.globalData.userInfo.schoolId) {

      that.setData({
        school_id: app.globalData.userInfo.schoolId,
      })
    }
  },

  onUnload: function() {},

  pageInit: function() {
    var that = this

    that.setData({
      imageUrl: app.globalData.file_url,
      nickname: app.globalData.userInfo.nickname,
      school_id: app.globalData.userInfo.schoolId,
      open_id: app.globalData.userInfo.openId,
      headPortraitUrl: app.globalData.userInfo.headPortraitUrl
    })
    that.getData()
  },

  handleChange: async function({
    detail
  }) {

    // console.log("detail",detail)
    // if (this.data.post_type.toString() == detail.key)
    //   return

    var that = this
    if (that.data.gPostType == 0) {
      this.setData({
        gPostType: 1,
        current: "1",
        pageNum: 1,
        allData: [],
        keyWord: "",
        nowShowData: []
      })
      // console.log('gpostType0-1:', that.data.pageNum)

    } else {
      this.setData({
        gPostType: 0,
        current: "0",
        pageNum: 1,
        allData: [],
        keyWord: "",
        nowShowData: []
      })

      // console.log('gpostType1-0:',that.data.pageNum)
    }

    await that.getData()
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
      url: '/pages/publish/publish'
    })
  },
  judgeNewInfo: async function() { //判断是否有新消息
    var that = this
    var parm = {
      api: '/message/selectAll',
      method: 'GET',
      name: '(获取个人的所有消息)',
      alert: false,
    }

    var ret = await app.myRequest(parm);//无警告
    if (ret.ok) {
      var message = ret.result.data.data
      for (var item of message)
        if (item.status == 1) {
          that.setData({
            hasNewInfo: true,
          })
          break;
        }
    } else {
      console.log(ret.msg)
    }
  }
})