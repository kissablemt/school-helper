// miniprogram/pages/mylogs/post/post.js
const app = getApp()

import regeneratorRuntime from '../../../utils/regenerator-runtime/runtime.js';
Page({
  data: {
    page: 1,
    pageSize: 4,
    dataCount: 0,
    hasMoreData: true,
    postData: [],
    nowShowData: [],
    nickname: {}
  },
  onShow: function() { 
    var that = this
    if (that.data.post_modify) {
      console.log('onShow触发')
      that.data.post_modify = false
    }
  },
  onLoad: function (options) {
    this.pageInit()
    console.log("onLoad：Done")
  },
  // 页面初始化
  pageInit: function () {
    var that = this
    if (app.globalData.initDone) { 
      var r = that.get_individual_posts()
      r.then(res => {
        console.log("get_individual_posts: Done.", res)
        that.setData({
          nickname: app.globalData.nickname,
          postData: res,
          school_id: app.globalData.school_id,
          open_id: app.globalData.userInfo.open_id
        })
        that.showPageData()
      })
    } else {
      app.initCallback = res => {
        if (res) {
          let r = that.get_individual_posts()
          r.then(res => {
            console.log("get_individual_posts: Done.", res)
            that.setData({
              nickname: app.globalData.nickname,
              postData: res,
              school_id: app.globalData.school_id,
              open_id: app.globalData.userInfo.open_id,
            })
            that.showPageData()
          })
        }
      }
    }
  },
  // 展示新页面
  showPageData: function () {

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
    console.log("showPageData: Done")
  },
  // 下拉刷新
  onReachBottom: function () {
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
      open_id: app.globalData.userInfo.open_id
    }).count().then(res => {
      sum = res.total
    })

    while (cnt < sum) {
      await db.collection('Post').where({ //循环获取所有新的数据
        open_id: app.globalData.userInfo.open_id
      }).orderBy('post_id', 'asc').skip(cnt).get()
        .then(res => {
          newPostData = newPostData.concat(res.data)
        })
      cnt += 20 //当跳出循环后，比起真正的数据多出20
    }
    that.data.postData = newPostData.concat(that.data.postData) //最新的数据放到开始,这里不需要刷新页面，就不setData
    console.log("flushOK")
    return new Promise(function (resolve, reject) {
      resolve('ok')
    })


  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target, //不能删除
      curr_post_id: e.currentTarget.dataset.curr_post_id
    })
    console.log(this.data.curr_post_id)
  },
  hideModal(e) {
    this.setData({
      modalName: null //不能删除
    })
  },

  // 获取该人的帖子
  get_individual_posts: function() {
    var that = this
    return new Promise(function (resolve, reject) {
      var i, j
      var open_id = app.globalData.userInfo.open_id
      var post = app.globalData.post
      console.log(app.globalData.post)
      var postData = []
      for (i = 0; i < post.length; ++i) { 
        for (j = 0; j < post[i].length; ++j) {
          if (open_id == post[i][j].open_id)
            postData.push(post[i][j])
        }
      }
      // console.log(open_id)
      // console.log("postData:",postData)
      resolve(postData)
    }) 
  },
  // 删除一个帖子
  deleteOne: function() {
    var del_list = []
    var that = this
    let page = that.data.page - 1
    let pageSize = that.data.pageSize
    let i, j

    del_list.push(this.data.curr_post_id)
    // console.log(app.globalData.post)
    // console.log(that.data.postData) 
 
    // 本页面删除帖子
    for (i=0; i < that.data.postData.length; ++i) {
      if (that.data.postData[i].post_id == del_list[0]) {
        that.data.postData.splice(i, 1)
        break;
      }
    } 
    console.log(that.data.postData)
    // 本页面删除帖子后渲染 
    that.setData({
      nowShowData: that.data.postData.slice(0, page * pageSize)
    })
    console.log(del_list)
    // 云端删除帖子
    wx.cloud.callFunction({
      name: 'del_post_records',
      data: {
        id: del_list 
      }
    }).then(res => {
      console.log(res)
    })
    
    // 本地删除帖子
    for (i = 0; i < app.globalData.post.length; ++i) {
      for (j = 0; j < app.globalData.post[i].length; ++j) {
        if (del_list[0] == app.globalData.post[i][j].post_id) {
          console.log(app.globalData.post[i][j])
          app.globalData.post[i].splice(j, 1)
          console.log(app.globalData.post)
          console.log("deleteOne: Done")
          return null;
        }
      }
    } 
  },
  // 修改post
  editOne: function(data) {
    var that = this
    var edit_post_id = data.post_id
    let page = that.data.page - 1
    let pageSize = that.data.pageSize
    let i, j
    console.log(data)
    console.log(app.globalData.post)
    console.log(that.data.postData)

    // 本页面修改帖子
    for (i = 0; i < that.data.postData.length; ++i) {
      if (that.data.postData[i].post_id == edit_post_id) {
        that.data.postData[i] = data
        break;
      }
    }
    console.log(that.data.postData)
    // 本页面修改帖子后渲染
    that.setData({
      nowShowData: that.data.postData.slice(0, page * pageSize)
    })
    //云端更新
    wx.cloud.callFunction({ 
      name:'updateBy_id',
      data:{
        table: 'Post', 
        id_name:'_id',
        id_value: data._id,
        mydata:{ 
          contact_way: data.contact_way, 
          money: data.money, 
          headline: data.headline, 
          content: data.content,
          school_id: data.school_id,
          post_type:data.post_type,
          goods_type:data.goods_type
        }
      }
    }).then(res=>{
      console.log("updateResult:",res)
    })
    

    // 本地修改帖子
    for (i = 0; i < app.globalData.post.length; ++i) {
      for (j = 0; j < app.globalData.post[i].length; ++j) {
        if (edit_post_id == app.globalData.post[i][j].post_id) {
          console.log(app.globalData.post[i][j])

          app.globalData.post[i][j] = data

          console.log(app.globalData.post)
          console.log("editOne: Done")
          return null;
        }
      }
    }  
  },
  goto_post: function (event) {
    var that = this
    var post_id = event.currentTarget.dataset.post_id
    console.log(event)
    
    wx.navigateTo({
      url: '../../post-show/post-show?post_id=' + post_id
    })
  }
  /*
  goto_modify: function() {
    var that = this
    wx.navigateTo({
      url: './post_modify/post_modify?post_id='+that.data.curr_post_id,
    })
  }
  */
})