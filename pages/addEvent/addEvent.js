// pages/history/history.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
const app = getApp()
const request = app.WxRequest;

Page({
    data: {
      oneList: [],
      twoList: [],
      threeList: [],
      repairSrc: '../image/repair_default.png',
      otherSrc: '../image/other_default.png',
      wayNum: null
    },
    onLoad: function (options) {
      this.setData({
        wayNum: options.wayNum
      })
      console.log(this.data.wayNum);
    },
  // 点击维修和其他事件上报更改图片
  rTouchstart (e) {
    console.log(e)
    this.setData({
      repairSrc: '../image/repair_click.png'
    })
  },
  rTouchend () {
    setTimeout(()=> {
      this.setData({
        repairSrc: '../image/repair_default.png'
      })
    },300)
  },
  oTouchstart (e) {
    console.log(e)
    this.setData({
      otherSrc: '../image/other_click.png'
    })
  },
  oTouchend () {
    setTimeout(()=> {
      this.setData({
        otherSrc: '../image/other_default.png'
      })
    }, 300)
  },
})