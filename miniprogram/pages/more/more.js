// miniprogram/pages/more/more.js
const app = getApp()
Page({
  data: {
    iconList: [{
      icon: 'activityfill',
      color: 'red',
      name: '失物招领',
      url: "/pages/lost-found/home/home"
    }, {
      icon: 'likefill',
      color: 'orange',
      name: '爱心活动',
      url: "/pages/activity/home/home"
    }],
  },
  onLoad:function(options){
    app.editTabbar()
  },

  gotoUrl(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  }
})