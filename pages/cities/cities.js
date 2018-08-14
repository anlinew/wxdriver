
import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    startDate: "开始日期",
    endDate: "结束日期",
    cities: [],
    cityShow: 'none',
    color: 'orange',
    // 是否跳转的标志（true跳转）
    flag: true,
    cityType: null,
  },
  startDateChange: function (e) {
    this.setData({
      startDate: e.detail.value
    })
  },
  endDateChange: function (e) {
    this.setData({
      endDate: e.detail.value
    })
  },
  onLoad: function (options) {
    this._getProvent();
    this.setData({
      cityType: options.type
    })
  },
  // 获取省份
  async _getProvent() {
    const payload = {type: 1, pageNo: 1, pageSize: 500}
    const res = await request.getRequest(api.cities,{data: payload})
    console.log(res);
    this.setData({
      cities: res.data
    })
  },
  // 获取城市
  async _cities(parentId) {
    const payload = {type: 10, parentId: parentId, pageNo: 1, pageSize: 500};
    const res = await request.getRequest(api.cities,{data: payload})
    console.log(res);
    this.setData({
      cities: res.data
    })
  },
  // 选择城市
  onChange(e) {
    console.log(e);
    this.data.flag = !this.data.flag;
    const parentId = e.currentTarget.dataset.id;
    const cityName = e.currentTarget.dataset.city;
    this._cities(parentId);
    if (this.data.flag) {
      if (this.data.cityType === '1') {
        // 给上个页面的城市名赋值
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          fromCity: cityName,
          fromId: parentId
        })
      } else if (this.data.cityType === '2') {
        // 给上个页面的城市名赋值
        var pages = getCurrentPages();
        var prevPage = pages[pages.length - 2];  //上一个页面
        prevPage.setData({
          toCity: cityName,
          toId: parentId
        })
      }
      wx.navigateBack({
        delta: 1
      })
    }
  },
})