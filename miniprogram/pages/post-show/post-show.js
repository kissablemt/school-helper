const app = getApp()
var util = require('../../utils/util.js')

Page({ 
  data: { 
    sortBy: '正序',
    sortByText: ['正序', '倒序'],
    cardCur: 0,
    // 以下为需要
    pageSize: 20, // 一次刷新的评论个数
    count: 0, // 显示的评论次数 
    total: 0, // 总评论次数
    isFavourite: false, // 收藏颜色
    isFavouriteOri: false, 
    isReplyComment: false,
    showAll: [],

    lastTimeSendMess: 1,
    inputContent:'', 
    to_open_id: '',  //一开始需要置 发帖人信息，否者直接发信息 会没有to_open_id,现在添加到getPost函数中
    isDeleted:false, //帖子是否已被删除 
    
  },
 
  onLoad: function(options) {
    var that = this
    that.setData({
      post_id: options.post_id,
      nickname: app.globalData.nickname
    })
  },

  onShow: function() {
    this.getPost()
  },

  onUnload: function() {
    if (this.data.isFavourite != this.data.isFavouriteOri) {
      // console.log("change")
      this.changeCollection()
    }
  },

  onReachBottom: function() {
    var that = this
    var count = parseInt(that.data.count + that.data.pageSize)
    if (count <= that.data.total) {
      that.setData({
        count: count
      })
    } else if (that.data.hasMore) {
      that.setData({
        count: that.data.total
      })
      that.data.hasMore = false
      console.log("没有更多数据")
    }
  },

  levelShowMore: function(e) {
    var index = e.currentTarget.dataset.index
    this.data.showAll[index] = !this.data.showAll[index]
    this.setData({
      showAll: this.data.showAll
    })
  },

  replyComment: function(e) {
    if (this.data.post == undefined) { //没有该帖子
      return;
    }
    var parent_id = e.currentTarget.dataset.parent_id
    var to_open_id = e.currentTarget.dataset.to_open_id 
    this.setData({
      isReplyComment: true,
      to_open_id: to_open_id,
      parent_id: e.currentTarget.dataset.parent_id,
    }) 
  },

  replyPost: function(e) {
    if (this.data.post == undefined) { //没有该帖子
      return;
    }
    this.setData({
      isReplyComment: false,
      to_open_id: this.data.post.open_id,
      parent_id: null
    })
  },

  doInput: function(event) {
    this.setData({
      inputContent: event.detail.value
    }) 
    // console.log(this.data.inputContent)
  },
  /**
   * @author 星星星
   * @date 2019/5/16
   * @description 完成：限制空字符提交，短时间内多次提交。
   *              未完成：提示图标太丑，需要更改
   */
  submit: function() {
    var that = this
    var lastTimeSendMess = that.data.lastTimeSendMess
    var nowTime = Date.parse(new Date()) //获取时间戳
    var intervalTime = (nowTime - lastTimeSendMess) / 1000
    var post = that.data.post
    var time = util.formatTime(new Date())
    var parent_id = that.data.parent_id

    if (intervalTime < 5) { //发信息间隔小于5秒
      wx.showToast({
        title: '太频繁啦',
        icon: 'success',
        duration: 1000,
      })
      return;
    }

    if ( that.data.inputContent == undefined || (/^\s{0,}$/).test(that.data.inputContent)) { //匹配空，或空格
      wx.showToast({
        title: '不能发空信息哦',
        icon: 'success',
        duration: 1000,
      })
      return;
    }
    //发送成功提示
    wx.showToast({
      title: '成功啦',
      icon: 'success',
      duration: 1000,
    })
    that.setData({
      lastTimeSendMess: nowTime //重置上次发评论的时间戳
    })
   
    wx.cloud.callFunction({
      name: 'add_record',
      data: {
        table: 'Comment',
        name_id: 'reply_id',
        mydata: { 
          post_id: post.post_id,
          headline: post.headline,
          content: that.data.inputContent,
          from_open_id: app.globalData.userInfo.open_id,
          to_open_id: that.data.to_open_id,
          parent_id: parent_id,
          date: time
        }
      }
    }).then(res => {
      that.setData({
        inputContent: '',
        isReplyComment: false,
      })
      that.getComment()
      that.sendMess(res.result.reply_id)
    })
  },

  // 发送留言消息
  sendMess: function(reply_id) {
    var that = this
    var mess = [reply_id, 0]
    wx.cloud.callFunction({
      name: 'send_mess',
      data: {
        to_open_id: that.data.post.open_id,
        mess: mess,
      }
    }).then(res => {
      // console.log(res)
    })
  },

  //获得帖子
  getPost: function() {

    const db = wx.cloud.database()
    var that = this
    var post_id = parseInt(this.data.post_id)
    db.collection("Post").where({
      post_id: post_id
    }).get().then(res => {
      // console.log("post是否存在",res)
      if(res.data[0] == undefined){ //没有该帖子 
        that.setData({
          isDeleted : true,
        })
        return;
      }
      let typeName = that.getTypeName(res.data[0].post_type,res.data[0].goods_type)
      that.setData({
        typeName:typeName,
        to_open_id: res.data[0].open_id, //初始化为回复贴主
        post: res.data[0]
      })

    }).then(res => {
      that.getComment() //获取该帖子的评论
    }).then(res => {
      db.collection("Message").where({ //是否已经收藏
        open_id: app.globalData.userInfo.open_id
      }).get().then(res => {
        var fav = res.data[0].my_collection
        for (let i = 0; i < fav.length; ++i) {
          if (fav[i] == post_id) {
            that.setData({
              isFavourite: true,
              isFavouriteOri: true,
            })
            break
          }
        }
      })
    })
  },
  // 获取评论
  getComment: function() {
    var that = this
    var post_id = that.data.post_id
    that.data.hasMore = true

    return wx.cloud.callFunction({
      name: 'get_comment',
      data: {
        post_id: parseInt(post_id)
      }
    }).then(res => {
      var data = [] 
      for (var i in res.result){ //把对象转换为数组
        data.push(res.result[i]) 
      }
      that.setData({
        comment_data: data,
        count: that.data.pageSize,
        total: data.length
      })
      this.judgeHasMore()
    })
  },
  judgeHasMore() {  //判断是否需要隐藏部分内容,显示查看更多按钮
    let that = this;
    const query = wx.createSelectorQuery();
    query.selectAll('.showFont').fields({
      size: true,
    }).exec(function (res) {
      // console.log(res, '所有节点信息')
      let lineHeight = 20 //样式中写死的行高，单位px

      for (let i = 0; i < res[0].length; i++) {
        // console.log(res[0][i].height)
        if (res[0][i].height / lineHeight > 3) {
          that.data.comment_data[i][0].hasButton = true
          that.data.comment_data[i][0].hideOverFlow = true;
        }
      }
      that.setData({
        comment_data: that.data.comment_data
      })
    })
  },
  toggleMore:function(e){
    var that = this
    let reply_id = e.currentTarget.dataset.reply_id
    for(let comment of this.data.comment_data){
      if (comment[0].reply_id == reply_id){
        comment[0].hideOverFlow = comment[0].hideOverFlow ? false : true
        that.setData({
          comment_data:that.data.comment_data
        })
        break
      }
    }
  },
  getTypeName: function (post_type, goods_type) {//用于判断帖子类型名称
    let name
    if(post_type == 0 || post_type == 1){
      if(goods_type == 0){
        name = '二手书'
      }
      else if(goods_type ==1){
        name = '二手车'
      }
      else if(goods_type == 2){
        name = '数码'
      }
      else if(goods_type == 3){
        name = '家电'
      }else{
        name = '其他'
      }
    }
    else if(post_type == 2){
      name = '失物招领'
    }
    else if(post_type == 3){
      name = '义捐活动'
    }
    return name;
  },

  // 收藏点击事件
  changeColor: function() {
    this.setData({
      isFavourite: !this.data.isFavourite
    });
  },
  // 改变收藏
  changeCollection: function() {
    var that = this
    wx.cloud.callFunction({
      name: 'change_collection',
      data: {
        open_id: app.globalData.userInfo.open_id,
        post_id: that.data.post.post_id,
      }
    }).then(res => {
      // console.log(res)
    })
  },
  //轮播图的显示
  previewCarousel:function(event){

    let currentImgId = event.currentTarget.dataset.img_id
    let currentImgPath = 'cloud://envir-i8vdp.656e-envir-i8vdp/image/' + currentImgId + '.jpg'
    let imgs = this.data.post.image
    let imgsPath = []

    for(let img_id of imgs){ //urls
      // console.log("img_id",img_id)
      imgsPath.push('cloud://envir-i8vdp.656e-envir-i8vdp/image/' + img_id + '.jpg')
    }

    wx.previewImage({
      current: currentImgPath,
      urls: imgsPath
    })
  },

  /** 排序 */
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  getSort(e) {
    if (this.data.sortBy != e.currentTarget.dataset.target) {
      this.data.comment_data.reverse()
      this.setData({
        comment_data: this.data.comment_data
      })
    }
    this.setData({
      sortBy: e.currentTarget.dataset.target
    })
  },
})