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
      otherSrc: '../image/other_default.png'
    },
    onLoad: function (options) {
    },
  // 点击更换图标
  // repairColor () {
  //   this.setData({
  //     repairSrc: '../image/repair_click.png'
  //   })
  // },
  // otherColor () {
  //   this.setData({
  //     otherSrc: '../image/other_click.png'
  //   })
  // }
})