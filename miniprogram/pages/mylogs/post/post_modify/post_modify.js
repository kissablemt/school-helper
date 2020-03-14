//index.js
const app = getApp()

Page({
  // 从这开始
  data: {
    school_id: 291,
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "义捐活动"],
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    before_post_type:0,
    before_post_type:0,
    post_type:0,
    goods_type:0,
    value: [0, 0],
    hiddenmodalput:true,
  },

  onLoad: function (options) {
    var that = this
    var pages = getCurrentPages()

    that.data.prevPage = pages[pages.length - 2]
    // console.log(that.data.prevPage)
    that.data.post_id = options.post_id
    that.init_page()
  },
  // 初始化
  init_page: function() {
    var that = this
    var post_list = app.globalData.post
    let i, j
    var post_id = that.data.post_id, flag=false
  
    // console.log("post_list",post_list)
    // console.log("post_id:",post_id)

    for (i = 0; i < post_list.length; ++i) {
      for (j = 0; j < post_list[i].length; ++j) {
        if (post_id == post_list[i][j].post_id){
          that.data.post = post_list[i][j]
          that.setData({
            before_post_type: post_list[i][j].post_type,
            before_goods_type: post_list[i][j].goods_type,
            post_type: post_list[i][j].post_type,
            goods_type: post_list[i][j].goods_type,
          })
          flag = true
          break;
        }
      }
      if (flag)
        break;
    }
    
    that.setData({
      post: that.data.post
    })
  },

  bindChange(e) {
    const val = e.detail.value
    // console.log(val)
    this.setData({
      post_type: val[0],
      goods_type: val[1],
    })
  },

  input_headline(e) {
    var that = this
    that.data.post.headline = e.detail.value
  },
  input_price(e) {
    var that = this
    that.data.post.money = e.detail.value  
  },
  input_contact(e) {
    var that = this
    that.data.post.concat_way = e.detail.value
  },
  input_content(e) {
    var that = this
    console.log(e.detail.value)
    that.data.post.content = e.detail.value
  },
  changeSchool: function (event) { //改变学校
    wx.navigateTo({
      url: '/pages/school/school?temp=1',
    })
  },

  getInfo: function () {
    this.setData({
      hiddenmodalput: false
    }) 
  },
  cancelM: function () {
    var that = this
    that.data.post.post_type = that.data.before_post_type
    that.data.post.goods_type = that.data.before_goods_type
    this.setData({
      post:that.data.post,  
      post_type: that.data.before_post_type,
      goods_type: that.data.before_goods_type,
      hiddenmodalput: true
    })
  },
  comfirmP: function (e) {
    var that = this
    that.data.post.post_type = that.data.post_type
    that.data.post.goods_type = that.data.goods_type

    this.setData({
      post: that.data.post,
      before_post_type: that.data.post_type,
      before_goods_type: that.data.goods_type,
      hiddenmodalput: true
    })
  },
  // 修改完成
  modify_complete: function() {
    this.data.prevPage.editOne(this.data.post)
    console.log('返回')
    wx.navigateBack({
      delta: 1
    })
  },
})