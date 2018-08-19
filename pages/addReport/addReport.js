// pages/history/history.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;

Page({
    data: {
      oneList: [],
      twoList: [],
      threeList: [],
      wayNum: null
    },
    onLoad: function (options) {
      this.setData({
        wayNum: options.wayNum
      })
      this.getDict();
    },
    // 获取单据类型字典
    async getDict() {
      const oneList = (await request.getRequest(api.dictApi, {
        data: { key: 'mileage' }
      })).data
      const twoList = (await request.getRequest(api.dictApi, {
        data: { key: 'fuel_subsidy' }
      })).data
      const threeList =( await request.getRequest(api.dictApi, {
        data: { key: 'expenses' }
      })).data
      this.setData({
        oneList: oneList,
        twoList: twoList,
        threeList: threeList
      })
    }
})