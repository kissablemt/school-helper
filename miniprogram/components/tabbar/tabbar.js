// tabBarComponent/tabBar.js
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabbar: {
      type: Object,
      value: {
        "backgroundColor": "#ffffff",
        "color": "#979795",
        "selectedColor": "#1c1c1b",
        "list": [
          {
            "pagePath": "/pages/index/index",
            "iconPath": "icon/index.png",
            "selectedIconPath": "icon/index_green.png",
            "text": "首页" 
          },
          {
            "pagePath": "/pages/publish/publish",
            "iconPath": "icon/publish.png",
            "isSpecial": true,
            "text": "发布"
          },
          { 
            "pagePath": "/pages/more/more",
            "iconPath": "icon/more.png",
            "selectedIconPath": "icon/more_green.png",
            "text": "更多"
          }
        ]
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // isIphoneX: app.globalData.systemInfo.model == "iPhone X" ? true : false,
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
