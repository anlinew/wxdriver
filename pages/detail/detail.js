import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    wayNum: null,
    detail: {}
  },
  onLoad: function (options) {
    this.setData({
      wayNum: options.wayNum
    })
    this._getDetail();
  },
  async _getDetail() {
    const res = (await request.getRequest(api.history, { data: {waybillNum: this.data.wayNum}})).data;
    console.log(res);
    res[0].taskDetails.forEach(item=> {
      if (item.arriveTime) { item.arriveTime = this.etDateStr(item.arriveTime.replace(/\-/g, '/'));}
      if (item.scheduleTime) { item.scheduleTime = this.etDateStr(item.scheduleTime.replace(/\-/g, '/')); }
    })
    this.setData({
      detail: res[0]
    })
  },
  // 跳转到事件列表
  toEvent() {
    wx.navigateTo({
      url: '../reportEvent/reportEvent?wayNum='+this.data.wayNum
    })
  },
  // 时间格式转换
  etDateStr(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
    const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
    return m + '-' + d + ' ' + hh + ':' + mm;
  },
})