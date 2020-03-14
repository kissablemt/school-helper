//mylogs-home.js
//获取应用实例
const app = getApp()

Page({
  data: {
   
    hiddenmodalput: true,
    /*名字模态框*/
    phonemodalInput: true, 
    /*手机模态框*/
    userInfo: {}, 
    open_id: null,
    hasUserInfo: false,
    hasNewInfo:false,
  },
  //事件处理函数   
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function() { 
    var that = this
    this.setData({ //获取globalData中的数据
      userInfo: getApp().globalData.userInfo,
      open_id: getApp().globalData.userInfo.open_id,
    }) 
    
  },
  onShow: function() {
    this.judgeNewInfo()  //show的时候判断是否有新info
  },
  //更换头像   
  setPhotoInfo: function() {
    var that = this;
    var open_id = that.data.open_id;
    wx.chooseImage({
      count: 1, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认是二者都有
      sourceType: ['camera', 'album'], //可以指定来源是相机还是相册，默认是二者都有
      success: function(res) {
        var tempFilePath = res.tempFilePaths[0]

        wx.cloud.uploadFile({
          cloudPath: 'avatar/' + open_id + '.jpg',
          filePath: tempFilePath,
          success: function(res) { //上传图片成功
            console.log(res)

            that.setData({
              open_id:1
            })
            setTimeout(function(){
              console.log("执行了")
              that.setData({
                open_id: open_id
              })
            },2000)
          }
        })
      },
    })
  },
  //更改名字
  setName: function() {
    this.setData({
      hiddenmodalput: false
    })
  },
  /*模态框取消*/
  cancelM: function(e) {
    this.setData({
      hiddenmodalput: true,
    })
  },
  //模态框确认
  confirmM: function(e) {

    var that = this
    const db = wx.cloud.database()
    const name = e.detail.value.nickname
    const open_id = that.data.userInfo.open_id;

    that.data.userInfo['nickname'] = name;
    this.setData({
      hiddenmodalput: true,
      userInfo: that.data.userInfo
    })
    wx.cloud.callFunction({
      name: 'updateBy_id',
      data: {
        table: "User",
        id_name: "open_id",
        id_value: open_id,
        mydata: {
          nickname: name
        }
      }
    }).then(res => {
      console.log("res:", res)
    })
  },
  /*获取手机号*/

  getContact_way: function(e) {
    this.setData({
      phonemodalInput: false
    })
  },
  cancelP: function(e) {
    this.setData({
      phonemodalInput: true,
    })
  },
  confirmP: function(e) {
    var that = this
    var contact_way = e.detail.value.contact_way
    console.log(contact_way)
    that.data.userInfo['contact_way'] = contact_way;
    that.setData({
      phonemodalInput: true,
      userInfo: that.data.userInfo
    })
    wx.cloud.callFunction({
      name: 'updateBy_id',
      data: {
        table: "User",
        id_name: "open_id",
        id_value: that.data.userInfo.open_id,
        mydata: {
          contact_way: contact_way
        }
      }
    }).then(res => {
      console.log("res:", res)
    })

  },
  judgeNewInfo:function(){//判断是否有新消息
    var that = this
    const db = wx.cloud.database()
    db.collection('Message').where({
      open_id: that.data.userInfo.open_id
    }).get().then(res => {
      // console.log("res", res)
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

  /*前往我的消息*/
  getInfo: function(e) {
    wx.navigateTo({
      url: '../info/info',
    })
  },
  /*前往发布的帖子*/
  getPost: function(e) {
    wx.navigateTo({
      url: '../post/post',
    })
  },
  /*前往收藏的帖子*/
  getFavorite: function(e) {
    wx.navigateTo({
      url: '../favorite/favorite',
    })
  },

  bindGetUserInfo: function(e) {
    console.log(e.detail.userInfo)
  }

})