//index.js
const app = getApp()

Page({
  // 从这开始
  data: {
    // 图片有关的数据须有以下两数据
    hiddenmodalput: true,
    imagePaths: [],
    imageID: [],
    headline: "",
    content: "",
    price: 0,
    contact_way: "",
    post_type_text: ["二手商品", "二手商品求购", "失物招领", "爱心活动"],
    post_type: 0,
    goods_type_text: ["二手书", "二手车", "数码", "家电", "其他"],
    goods_type: 0,
    value: [0, 0],
    school_id: 291, //默认291，理工版
    before_post_type:0,
    before_goods_type: 0,
    canShowModalput:true,
  },

  onLoad: function(options) {
    var that = this

    if (options.post_type && options.goods_type) { //不是tabar处发布的

      this.setData({
        canShowModalput:false,
        before_post_type: parseInt(options.post_type),
        before_goods_type: options.goods_type,
        post_type: parseInt(options.post_type), //设置初始化参数
        goods_type: options.goods_type,
      })
    }
    this.setData({
      imageWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.3,
      yWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.02,
      zWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.03
    })

    if (app.globalData.checked) {
      if (app.globalData.userInfo) {
        that.setData({
          open_id: app.globalData.userInfo.open_id
        })
      }
    } else {
      app.userInfoCallback = res => {
        if (res && app.globalData.userInfo) {
          that.setData({
            open_id: app.globalData.userInfo.open_id
          })
        }
      }
    }
  },

  enlargeImage: function(event) {
    var index = event.currentTarget.dataset.index // 需要设置data-index
    var that = this
    var image_list = []
    var len = that.data.imagePaths.length

    for (let i = 0; i < len; ++i) {
      image_list.push(that.data.imagePaths[i])
    }　　
    wx.previewImage({
      current: that.data.imagePaths[index],
      　urls: image_list,
      　　
    })
  },

  deleteImage: function(e) {
    var that = this
    wx.showModal({
      title: '确认删除图片',
      success(res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index
          that.data.imagePaths.splice(index, 1)
          that.setData({
            imagePaths: that.data.imagePaths
          })
        } else {

        }
      }
    })

  },

  // 上传图片，获取data中的 imagePaths: []，imageID: [] 这两个字段
  getImageFiles: function() {
    var that = this
    const db = wx.cloud.database()
    var that = this
    var count, start
    

    that.data.imageID = []
    wx.chooseImage({
      count: 9 - that.data.imagePaths.length, //最多可以选择的图片总数
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success: function(res) {
        that.data.imagePaths = that.data.imagePaths.concat(res.tempFilePaths)
        that.setData({
          imagePaths: that.data.imagePaths
        })
        // console.log(that.data.imagePaths) 
        count = res.tempFilePaths.length

        db.collection('ID').doc('database_id').get()
          .then(res => {
            start = res.data['image_id']
            for (let i = 1; i <= that.data.imagePaths.length; ++i) {
              that.data.imageID.push(i + start)
            }
            // console.log(that.data.imageID)
          }).
        catch(console.error)
      }
    })
  },
  // 以下是添加一条记录的函数
  add_rec: function() {
    var that = this


    // 若有图片则以下for循环必须有
    // 否则可以注释以下for循环
    for (let i = 0; i < that.data.imageID.length; ++i) {
      wx.cloud.uploadFile({
        cloudPath: 'image/' + that.data.imageID[i] + '.jpg',
        filePath: that.data.imagePaths[i],
        success: function(res) {
          // console.log(res.fileID)
        }
      })
    }


    // 调用添加函数
    return wx.cloud.callFunction({
      name: 'add_record',

      data: {
        table: "Post",
        name_id: "post_id",
        // 若有图片image_num字段不能少，否则可以注释
        image_num: that.data.imageID.length,
        mydata: {
          open_id: that.data.open_id,
          image: that.data.imageID,
          headline: that.data.headline,
          content: that.data.content,
          contact_way: that.data.contact_way,
          money: that.data.price,
          goods_type: that.data.goods_type,
          post_type: that.data.post_type, 
          school_id: that.data.school_id
        }
      }
    }).then(res=>{ //刷新帖子
      app.init()
    })
  },

  bindChange(e) {
    const val = e.detail.value
    console.log(val)
    this.setData({
      post_type: val[0],
      goods_type: val[1],
    })
  },

  input_headline(e) { 
    this.setData({
      headline: e.detail.value
    })
  },
  input_price(e) {
    this.setData({
      price: e.detail.value
    })
  },
  input_contact(e) {
    this.setData({
      contact_way: e.detail.value
    })
  },
  input_content(e) {
    this.setData({
      content: e.detail.value
    })
  },
  changeSchool: function(event) { //改变学校
    wx.navigateTo({
      url: '/pages/school/school?temp=1',
    })
  },

  publish() {
    var that = this
    var info;
    var succ = false
    if (that.data.open_id == null) {
      info = "验证失败"
    } else if (that.data.imageID.length == 0 && that.data.post_type != 1) {
      info = "至少有一张图片"
    } else if (that.data.headline == "" || that.data.content == "" || that.data.contact_way == "" || (that.data.post_type != 2  &&that.data.post_type != 3  && !that.data.price) || that.data.school_id == null) {
      info = "内容不能为空"
    } else {
      succ = true
    }
    if (succ) {
      this.add_rec().then(res => {
        wx.showToast({
          title: '发布成功',
        })
      }).then(res => {
        setTimeout(function() {
          wx.showTabBar()
          wx.switchTab({
            url: '/pages/index/index',
          })
        }, 500)
      })
    } else {
      wx.showToast({
        title: info,
      })
    }
  },
  getInfo: function() {
    if(this.data.canShowModalput == true){
      this.setData({
        hiddenmodalput: false
      }) 
    }
  },
  cancelM: function() {
    var that = this
    this.setData({
      post_type:that.data.before_post_type,
      goods_type:that.data.before_goods_type,
      hiddenmodalput: true
    })
  },
  comfirmP: function(e) {
    var that = this
    this.setData({
      before_post_type:that.data.post_type,
      before_goods_type:that.data.goods_type,
      hiddenmodalput: true
    })
  }
})