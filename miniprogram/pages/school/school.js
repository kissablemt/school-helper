// miniprogram/pages/school/school.js
const app = getApp();
Page({
  data: {
    hidden: true,
    input_keyword: "",
    showProvince: true,
    provinceName: [
      "北京",
      "天津",
      "上海",
      "重庆",
      "河北",
      "河南",
      "云南",
      "辽宁",
      "黑龙江",
      "湖南",
      "安徽",
      "山东",
      "新疆",
      "江苏",
      "浙江",
      "江西",
      "湖北",
      "广西",
      "甘肃",
      "山西",
      "内蒙",
      "陕西",
      "吉林",
      "福建",
      "贵州",
      "广东",
      "青海",
      "西藏",
      "四川",
      "宁夏",
      "海南",
      "台湾",
      "香港",
      "澳门",
    ]
  },

  onLoad(options) { //两种进入模式( 0:个人设置-学校、 1:顶部选择学校 )
    this.setData({
      mode: JSON.stringify(options) == "{}"
    })
  },

  getSchools: function(province) {
    var that = this
    that.setData({
      commom_school: wx.getStorageSync("commom_school")
    })

    if (province.currentTarget)
      province = province.currentTarget.dataset.province
    wx.cloud.database().collection('Province').where({
      province_name: province
    }).get().then(res => {

      var list = res.data[0]['list']
      that.setData({
        list: list,
        listCur: list[1].key,
        showProvince: false,
      })
      var itemCnt = 0
      for (let i = 0; i < list.length; ++i) {
        if (list[i].data.length) {
          itemCnt++;
        }
      }
      that.data.itemCnt = itemCnt
    }).then(res => {
      that.pageInit()
    })
  },

  /** 选择学校 */
  selectSchool: function(e) {
    var school_id = e.currentTarget.dataset.school_id
    var school_name = e.currentTarget.dataset.school_name
    var that = this
    return new Promise(function(resolve, reject) {
      if (that.data.mode) {
        app.globalData.school_id = school_id
        app.globalData.school_name = school_name
      } else {
        var pages = getCurrentPages()
        var prev = pages[pages.length - 2]
        prev.setData({
          school_id: school_id,
          school_name: school_name,
        })
      }
      resolve("Selected school:", school_id)
    }).then(res => {
      wx.navigateBack({
        delta: 1
      })
    })
  },

  // 省份分类触发
  selectProvince: function() {
    this.setData({
      showProvince: true
    })
  },

  // 关键字输入
  form_input_keyword: function(event) {
    this.setData({
      input_keyword: event.detail.value
    })
  },
  // 搜索触发
  search: function() {
    var i, j
    var search_list = []
    var list = this.data.list
    var keyword = this.data.input_keyword
    if (!keyword || keyword == "") {
      this.setData({
        list: list,
        listCur: list[1].key
      })
      return
    }
    var itemCnt = 0
    for (i = 0; i < list.length; ++i) {
      let len = list[i]['data'].length
      let item = list[i]['data']
      var curr = {
        key: list[i]['key'],
        data: []
      };
      var tag = false
      for (j = 0; j < len; ++j) {
        if (item[j]['name'].indexOf(keyword) != -1) {
          curr['data'].push(list[i]['data'][j])
          tag = true
        }
      }
      if (tag){
        itemCnt++
        search_list.push(curr)
      }
    }

    this.data.itemCnt = itemCnt
    this.setData({
      list: search_list,
      listCur: search_list[1].key
    })
  },
  // 添加常用学校
  add_common: function() {
    var that = this
    that.data.common_school.push(that.data.choose_school)

    wx.setStorage({
      common_school: that.data.common_school
    }).then(res => {
      console.log(res.data)
    })
  },


  /** 不改 */
  //获取文字信息
  pageInit() {
    let that = this;
    wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function(res) {
      that.setData({
        boxTop: res.top,
        boxBottom: res.bottom
      })
    }).exec();
    wx.createSelectorQuery().select('.indexes').boundingClientRect(function(res) {
      that.setData({
        barTop: res.top
      })
    }).exec()
  },
  getCur(e) {
    this.pageInit()
    this.setData({
      hidden: false,
      listCur: this.data.list[e.target.id].key,
    })
  },
  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur
    })
  },
  //滑动选择Item
  tMove(e) {
    let y = e.touches[0].clientY,
      offsettop = this.data.boxTop,
      offsetbottom = this.data.boxBottom,
      that = this;
    //判断选择区域,只有在选择区才会生效
    var unit = (offsetbottom - offsettop) / (this.data.itemCnt)
    if (y > offsettop) {
      let num = parseInt((y - offsettop) / unit);
      let list = that.data.list
      for (let i = 0, j = 0; i < list.length; ++i) {
        if (list[i].data.length) {
          if (j == num) {
            this.setData({
              listCur: that.data.list[i].key
            })
            break
          }
          j++
        }
      }

    };
  },
  //触发全部开始选择
  tStart() {
    this.setData({
      hidden: false
    })
  },
  //触发结束选择
  tEnd() {
    this.setData({
      hidden: true,
      listCurID: this.data.listCur
    })
  },
});