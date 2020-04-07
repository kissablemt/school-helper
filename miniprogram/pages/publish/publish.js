//index.js
const app = getApp()

Page({
  // 从这开始
  data: {
    // 图片有关的数据须有以下两数据
    hiddenmodalput: true,
    imagePaths: [],
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
    before_post_type: 0,
    before_goods_type: 0,
    canShowModalput: true,
  },

  onLoad: function (options) {
    var that = this

    if (options.post_type && options.goods_type) { //不是tabar处发布的

      this.setData({
        canShowModalput: false,
        before_post_type: parseInt(options.post_type),
        before_goods_type: parseInt(options.goods_type),
        post_type: parseInt(options.post_type), //设置初始化参数
        goods_type: parseInt(options.goods_type),
      })
    } else {
      
    }
    this.setData({
      imageWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.3,
      yWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.02,
      zWidth: wx.getSystemInfoSync().windowWidth * 0.9 * 0.03
    })
  },

  enlargeImage: function (event) {
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

  deleteImage: function (e) {
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

  // 上传图片，获取data中的 imagePaths: []这两个字段
  getImageFiles: function () {
    var that = this
    // const db = wx.cloud.database()
    var that = this
    var count, start
    var maxImageSize = 1000000

    wx.chooseImage({
      count: 9 - that.data.imagePaths.length, //最多可以选择的图片总数
      sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有

      success: function (res) {
        if (res.tempFiles[0].size > maxImageSize) {
          // console.log("Image too large")
          wx.showToast({
            title: '图片必须小于1M'
          })
        } else {
          that.data.imagePaths = that.data.imagePaths.concat(res.tempFilePaths)
          that.setData({
            imagePaths: that.data.imagePaths
          })
        }
      }
    })
  },
  // 以下是添加一条记录的函数
  async add_rec() {
    var that = this
    var len = that.data.imagePaths.length

    // 若有图片则以下for循环必须有
    // 否则可以注释以下for循环
    let base64Image = []
    let imagesString = ''
    for (let i = 0; i < len; ++i) {
      base64Image[i] = wx.getFileSystemManager().readFileSync(that.data.imagePaths[i], 'base64')
      if (i == 0) {
        imagesString = base64Image[i]
      }
      else {
        imagesString = imagesString + ',' + base64Image[i]
      }
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: app.globalData.api_url+'post',
        method: 'POST',
        header: {
          'Authorization': 'Bearer ' + app.globalData.accessToken
        },
        data: {
          headline: that.data.headline,
          content: that.data.content,
          money: that.data.price,
          goodsType: that.data.goods_type+1,
          postType: that.data.post_type+1,
          images: imagesString
        },
        success(res) {
          if (res.data.code == 200) {
            // console.log("success:", res)
            wx.showToast({
              title: '发布成功'
            })
            resolve(res)
          } else {
            resolve(res)
            // console.log("success:", res)
            wx.showToast({
              title: '内容不符！失败'
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

  bindChange(e) {
    const val = e.detail.value
    // console.log(val)
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
  changeSchool: function (event) { //改变学校
    wx.navigateTo({
      url: '/pages/school/school?temp=1',
    })
  },

  async publish() {
    var that = this
    var info;
    var succ = false

    if (app.globalData.userInfo.openId == null) {
      info = "用户验证失败"
    } else if (that.data.imagePaths.length == 0) {
      info = "至少有一张图片"
    } else if (that.data.headline == "" || that.data.content == "" || (that.data.post_type != 2 && that.data.post_type != 3 && !that.data.price) || that.data.school_id == null) {
      info = "内容不能为空"
    } else {
      succ = true
    }

    if (succ) {
      await this.add_rec().then(res => {
        // console.log('res:add_arc end')
        if (res.data.code == 200) {
          setTimeout(function () {
            wx.navigateBack()
          }, 1000)
        }
      })
    } else {
      wx.showToast({
        title: info,
      })
    }

  },
  getInfo: function () {
    if (this.data.canShowModalput == true) {
      this.setData({
        hiddenmodalput: false
      })
    }
  },
  cancelM: function () {
    var that = this
    this.setData({
      post_type: that.data.before_post_type,
      goods_type: that.data.before_goods_type,
      hiddenmodalput: true
    })
  },
  comfirmP: function (e) {
    var that = this
    this.setData({
      before_post_type: that.data.post_type,
      before_goods_type: that.data.goods_type,
      hiddenmodalput: true
    })
  }
})