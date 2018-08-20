import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;
// 格式转化为yy-MM-dd hh:mm:ss
const dateFormat = (day)=> {
  const dd = new Date(day);
  dd.setDate(dd.getDate());
  const y = dd.getFullYear();
  const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
  const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
  const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
  const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
  const ss = dd.getSeconds() > 9 ? dd.getSeconds() : '0' + dd.getSeconds();
  return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
}

Page({
  data: {
    driverId: null,
    messageList: null,
    pageNo: 1,
    pageSize: 10,
    now: dateFormat(new Date())
  },
  onLoad: async function (options) {
    await this._getDriverInfo();
    await this._getMessage();
  },
  async _getMessage() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    const payload = {};
    payload.pageNo = this.data.pageNo;
    payload.pageSize = this.data.pageSize;
    payload.userId = this.data.driverId;
    const res = (await request.getRequest(api.getMessage,{data:payload}));
    console.log(res);
    this.setData({
      messageList: res.data
    })
    setTimeout(function(){
      wx.hideLoading()
    },700)
    console.log(this.data.messageList)
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this._getMessage();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    },500)
  },
  // 上拉加载更多
  async onReachBottom() {
    wx.showLoading({
      title: '加载更多中...',
    })
    this.data.pageSize = this.data.pageSize + 10;
    await this._getMessage();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },

  // 获取司机的信息
  async _getDriverInfo() {
    const res = (await request.getRequest(api.driverInfo)).data;
    this.setData({
      driverId: res.id
    })
  },
})