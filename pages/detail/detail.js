import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    wayNum: null,
    detail: {},
    orderList: [],
    vinList: []
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
    if (res[0].status === 0) {
      res[0].status = '待下发';
      res[0].background = '#808080';
    } else if (res[0].status === 1) {
      res[0].status = '待接受';
      res[0].background = '#f77528';
    } else if (res[0].status === 2) {
      res[0].status = '待发车';
      res[0].background = '#f8b551';
    } else if (res[0].status === 3) {
      res[0].status = '运输中';
      res[0].background = '#4a9cf2';
    } else if (res[0].status === 4) {
      res[0].status = '已送达';
      res[0].background = '#5dc873';
    } else if (res[0].status === 5) {
      res[0].status = '已完成';
      res[0].background = '#19be6b';
    } else if (res[0].status === 6) {
      res[0].status = '已作废';
      res[0].background = '#919293';
    }
    res[0].taskDetails.forEach(item=> {
      if (item.arriveTime) { item.arriveTime = this.etDateStr(item.arriveTime.replace(/\-/g, '/'));}
      if (item.scheduleTime) { item.scheduleTime = this.etDateStr(item.scheduleTime.replace(/\-/g, '/')); }
    })
    const orderList = [];
    const vinList = [];
    res[0].cargoDetails.forEach(item=> {
      orderList.push(...item.orderNums);
      vinList.push(...item.vins);
    })
    this.setData({
      detail: res[0],
      orderList: orderList,
      vinList: vinList
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