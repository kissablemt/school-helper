const app = getApp()
var util = require('../../utils/util.js')

Page({ 
  data: { 
    sortBy: '正序',
    sortByText: ['正序', '倒序'],

    pageSize: 3, // 一次刷新的评论个数
    pageNum: 1,
    post: {},
    imageUrl: "",
    collectionData: {},
    isFavourite: false, // 收藏颜色
    isFavouriteOri: false, 
    to_open_id: '',  //一开始需要置 发帖人信息，否者直接发信息 会没有to_open_id,现在添加到getPost函数中
    parent_id: '',
    comment_data: [],
    openId: '',
    lastTimeSendMess: 1,
    inputContent: '', 
    isReplyComment: false,
    hiddenReport: true,
  },
 
  onLoad: async function(options) {
    var that = this
    that.setData({
      post_id: parseInt(options.post_id),
      openId: app.globalData.userInfo.openId,
      imageUrl: app.globalData.file_url
    })
    await this.getPost()
    
    console.log("onload")
    if (JSON.stringify(that.data.post) == '{}' || that.data.post.status != 1) {
      setTimeout(function () {
        wx.navigateBack()  
      }, 1000) //延迟时间 这里是1秒 
      
    }
  },

  onShow: function() {
    
  },

  onUnload: async function() {
    if (this.data.isFavourite != this.data.isFavouriteOri) {
      // console.log("change")
      await this.changeCollection()
    }
    console.log("onUnload")
  },
  onPullDownRefresh: async function () { //---下拉刷新帖子
    var that = this

    that.setData({
      pageNum: 1,
      comment_data: []
    })
    await that.getComment()
    
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500)
  },
  onReachBottom: async function() {
    var that = this

    await that.getComment()
  },

  // 回复评论
  replyComment: function(e) {
    console.log("replyComment")

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
  // 评论
  replyPost: function(e) {
    console.log("replyPost")
    if (this.data.post == undefined) { //没有该帖子
      return;
    }
    this.setData({
      isReplyComment: false,
      to_open_id: this.data.post.openId,
      parent_id: null
    })
  },
  // 获取输入
  doInput: function(event) {
    this.setData({
      inputContent: event.detail.value
    }) 
    // console.log(this.data.inputContent)
  },
  // 删除自己的评论
  deleteReply: async function (e) {
    var replyId = e.currentTarget.dataset.reply_id
    console.log("deleteReply(): ", replyId)

    let deleteReplyPromise = new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url + 'reply/' + replyId.toString(),
        method: 'DELETE',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
        },
        success(res) {
          if (res.data.code == 200) {
            console.log("success:", res)
            resolve(res)
            //发送成功提示
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000,
            })
          } else {
            resolve(res)
            console.log("request success, but response fail: ", res)
            wx.showToast({
              title: '删除失败'
            })
          }
        }, fail(msg) {
          reject(msg)
          wx.showToast({
            title: '系统异常'
          })
          // console.log(msg)
        }
      })
    })
    await deleteReplyPromise
    this.setData({
      pageNum: 1,
      comment_data: [],
      parentId: null,
      isReplyComment: false
    })
    await this.getComment()
  },
  /**
   * @author 星星星
   * @date 2019/5/16
   * @description 完成：限制空字符提交，短时间内多次提交。
   *              未完成：提示图标太丑，需要更改
   */
  submit: async function() {
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
        icon: 'fail',
        duration: 1000,
      })
      return;
    }

    if ( that.data.inputContent == undefined || (/^\s{0,}$/).test(that.data.inputContent)) { //匹配空，或空格
      wx.showToast({
        title: '发送内容不能为空',
        icon: 'fail',
        duration: 1000,
      })
      return;
    }
    if (that.data.parent_id == null) {
      let submitReplyPromise = new Promise((resolve, reject) => {
        wx.request({
          url: app.globalData.api_url + 'reply',
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          data: {
            postId: that.data.post_id,
            content: that.data.inputContent,
            toOpenId: that.data.to_open_id
          },
          success(res) {
            if (res.data.code == 200) {
              console.log("success:", res)
              resolve(res)
              //发送成功提示
              wx.showToast({
                title: '发送成功',
                icon: 'success',
                duration: 1000,
              })
              that.setData({
                lastTimeSendMess: nowTime, //重置上次发评论的时间戳
                inputContent: '',
                isReplyComment: false,
                parent_id: null
              })
            } else {
              resolve(res)
              console.log("request success, but response fail: ", res)
              wx.showToast({
                title: '发送失败'
              })
            }
          }, fail(msg) {
            reject(msg)
            wx.showToast({
              title: '系统异常'
            })
            // console.log(msg)
          }
        })
      })
      await submitReplyPromise
    } else {
      let submitReplyPromise = new Promise((resolve, reject) => {
        wx.request({
          url: app.globalData.api_url + 'reply',
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          data: {
            postId: that.data.post_id,
            content: that.data.inputContent,
            toOpenId: that.data.to_open_id,
            parentId: that.data.parent_id
          },
          success(res) {
            if (res.data.code == 200) {
              console.log("success:", res)
              resolve(res)
              //发送成功提示
              wx.showToast({
                title: '发送成功',
                icon: 'success',
                duration: 1000,
              })
              that.setData({
                lastTimeSendMess: nowTime, //重置上次发评论的时间戳
                inputContent: '',
                isReplyComment: false,
                parent_id: null
              })

            } else {
              resolve(res)
              console.log("request success, but response fail: ", res)
              wx.showToast({
                title: '发送失败'
              })
            }
          }, fail(msg) {
            reject(msg)
            wx.showToast({
              title: '系统异常'
            })
            // console.log(msg)
          }
        })
      })
      await submitReplyPromise
    }
    
    this.setData({
      pageNum: 1,
      comment_data: []
    })
    await this.getComment()
  },

  //获得帖子
  getPost: async function() {
    var that = this
    
    // 获取帖子
    let postDataPromise = new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url + 'post/selectOne/' + that.data.post_id.toString(),
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
          //postId: that.data.post_id
        },
        success(res) {
          if (res.data.code == 200) {
            console.log("success:", res)
            resolve(res)

            let typeName = that.getTypeName(res.data.data.postType, res.data.data.goodsType)
            that.setData({
              post: res.data.data,
              typeName: typeName,
              to_open_id: res.data.data.openId, //初始化为回复贴主
            })
          } else {
            resolve(res)
            console.log("request success, but response fail: ", res)
            wx.showToast({
              title: '获取帖子失败'
            })
          }
        }, fail(msg) {
          reject(msg)
          wx.showToast({
            title: '系统异常'
          })
          // console.log(msg)
        }
      })
    })

    await postDataPromise
    console.log("postDataPromise")
    if (JSON.stringify(that.data.post) == '{}' || that.data.post.status != 1) {
      wx.showToast({
        title: '获取帖子失败',
        icon: 'success'
      })
      return ;
    }
    await this.getComment()
    console.log("getComment()")
    await this.getCollection()
    console.log("collectionsDataPromise")
    
  },
  // 显示判断更多
  judgeHasMore: async function() {  //判断是否需要隐藏部分内容,显示查看更多按钮
    let that = this;

    for (let i = (that.data.pageNum-2) * that.data.pageSize;  i < that.data.comment_data.length; ++i) {
      if (that.data.comment_data[i].replys.length > 0) {
        that.data.comment_data[i].hideOverFlow = false;  
        that.data.comment_data[i].hasButton = true;
      }
    }
    that.setData({
      comment_data: that.data.comment_data
    })
  },
  // 获取评论
  getComment: async function() {
    var that = this
    that.data.hasMore = true

    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url + 'reply/selectAll/' + that.data.post_id.toString(),
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
          pageNum: that.data.pageNum,
          pageSize: that.data.pageSize
        },
        success(res) {
          if (res.data.code == 200) {
            console.log("success:", res)
            resolve(res)
            if (res.data.data && res.data.data.length) {
              that.setData({
                pageNum: that.data.pageNum + 1,
                comment_data: that.data.comment_data.concat(res.data.data),
              })
              that.judgeHasMore()
            }
          } else {
            resolve(res)
            console.log("request success, but response fail: ", res)
            wx.showToast({
              title: '获取留言失败'
            })
          }
        }, fail(msg) {
          reject(msg)
          wx.showToast({
            title: '系统异常'
          })
          // console.log(msg)
        }
      })
    })
  },
  // 获取收藏
  getCollection: async function() {
    var that = this

    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url + 'collection/selectAll',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
        },
        success(res) {
          if (res.data.code == 200) {
            console.log("success:", res)
            resolve(res)
            
            var collections = res.data.data
            for (let i = 0; i < collections.length; ++i) {
              if (collections[i].postId == that.data.post_id) {
                that.setData({
                  collectionData: collections[i],
                  isFavourite: true,
                  isFavouriteOri: true,
                })
                break
              }
            }
            
          } else {
            resolve(res)
            console.log("request success, but response fail: ", res)
          }
        }, fail(msg) {
          wx.showToast({
            title: '系统异常'
          })
          reject(msg)
          console.log(msg)
        }
      })
    })
  },
  toggleMore:function(e){
    var that = this
    let reply_id = e.currentTarget.dataset.reply_id
    for(let comment of this.data.comment_data){
      if (comment.replyId == reply_id){
        comment.hideOverFlow = comment.hideOverFlow ? false : true
        that.setData({
          comment_data: that.data.comment_data
        })
        break
      }
    }
  },
  getTypeName: function (post_type, goods_type) {//用于判断帖子类型名称
    let name
    if(post_type == 1 || post_type == 2){
      if(goods_type == 1){
        name = '二手书'
      }
      else if(goods_type ==2){
        name = '二手车'
      }
      else if(goods_type == 3){
        name = '数码'
      }
      else if(goods_type == 4){
        name = '家电'
      }else{
        name = '其他'
      }
    }
    else if(post_type == 3){
      name = '失物招领'
    }
    else if(post_type == 4){
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
  changeCollection: async function() {
    var that = this

    if (that.data.isFavourite) {
      console.log("收藏")
      return new Promise((resolve, reject) => {
        wx.request({
          url: app.globalData.api_url + 'collection',
          method: 'POST',
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          data: {
            postId: that.data.post_id,
            openId: app.globalData.userInfo.openId
          },
          success(res) {
            if (res.data.code == 200) {
              console.log("success:", res)
              resolve(res)
            } else {
              resolve(res)
              console.log("request success, but response fail: ", res)
            }
          }, fail(msg) {
            reject(msg)
            wx.showToast({
              title: '系统异常'
            })
            console.log(msg)
          }
        })
      })
    } else {
      console.log("取消收藏")

      return new Promise((resolve, reject) => {
        wx.request({
          url: app.globalData.api_url + 'collection/' + that.data.collectionData.collectionId,
          method: 'DELETE',
          header: {
            'Authorization': 'Bearer ' + app.globalData.accessToken
          },
          data: {
            postId: that.data.post_id,
            openId: app.globalData.userInfo.openId
          },
          success(res) {
            if (res.data.code == 200) {
              console.log("success:", res)
              resolve(res)
            } else {
              resolve(res)
              console.log("request success, but response fail: ", res)
            }
          }, fail(msg) {
            reject(msg)
            wx.showToast({
              title: '系统异常'
            })
            // console.log(msg)
          }
        })
      })
    }
  },
  //轮播图的显示
  previewCarousel:function(event){

    let currentImgId = event.currentTarget.dataset.img_id
    let currentImgPath = this.data.imageUrl + currentImgId.imageUrl
    let imgs = this.data.post.images
    let imgsPath = []

    for(let img_id of imgs){ //urls
      console.log("img_id",img_id)
      imgsPath.push(this.data.imageUrl + img_id.imageUrl)
    }

    wx.previewImage({
      current: currentImgPath,
      urls: imgsPath
    })
  },
  // 进行举报
  gotoReport: function() {
    var that = this
    this.setData({
      hiddenReport: !that.data.hiddenReport
    })
  },
  // 取消举报
  cancelReport: function() {
    var that = this
    this.setData({
      hiddenReport: !that.data.hiddenReport
    })
  },
  // 确认举报
  confirmReport: async function(e) {
    var that = this
    
    const reportMess = e.detail.value.reportMess
    console.log(reportMess)

    let reportPromise = new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url + 'report',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
          postId: that.data.post.postId,
          remark: reportMess
        },
        success(res) {
          if (res.data.code == 200) {
            console.log("success:", res)
            resolve(res)
            wx.showToast({
              title: '举报成功'
            })
          } else {
            resolve(res)
            console.log("request success, but response fail: ", res)
            wx.showToast({
              title: '举报失败'
            })
          }
        }, fail(msg) {
          reject(msg)
          console.log(msg)
          wx.showToast({
            title: '系统异常'
          })
        }
      })
    })
    await reportPromise

    this.setData({
      hiddenReport: !that.data.hiddenReport
    })
  },

})