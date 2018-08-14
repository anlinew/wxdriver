import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import qs from '../../plugins/qs.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    pageNo: 1,
    pageSize: 100,
    weList: [],
    current: '',
    position: 'right',
    openid: null,
    userName: null
  },
  async onLoad(option) {
    await this._getDriverInfo();
    await this._refush();
  },
  // 刷新微信列表
  async _refush() {
    const res = await request.postRequest(api.upList+'?username='+this.data.userName);
    if (res.result) {
      this._getWelist();
    }
  },
  // 获取微信的列表
  async _getWelist() {
    const payload = {};
    payload.pageNo = 1;
    payload.pageSize = 10;
    if (this.data.phone) {
      payload.driverPhone = this.data.phone;
    } else {
      delete payload.driverPhone
    }
    const res = (await request.getRequest(api.weList, { data: payload })).data;
    this.setData({
      weList: res
    })
  },
  // 获取司机的信息
  async _getDriverInfo() {
    const res = (await request.getRequest(api.driverInfo)).data;
    this.setData({
      userName: res.username
    })
  },
  // 手机号的输入
  inputTyping(e) {
    this.setData({
      phone: e.detail.value
    })
  },
  handleFruitChange(e) {
    this.setData({
      current: e.detail.value,
      openid: e.detail.value
    });
  },
  // 绑定微信
  async bindWe() {
    const payload = {};
    payload.type = 1;
    payload.username = this.data.userName;
    payload.openid = this.data.openid;
    wx.showModal({
      title: '绑定微信',
      confirmColor: '#666',
      content: '是否绑定微信',
      success: async (e) => {
        if (e.confirm) {
          const res = await request.putRequest(api.bind+'?'+qs.stringify(payload));
          console.log(res);
          if (res.result) {
            wx.showToast({
              icon: 'success',
              title: '绑定微信成功',
            })
            this._getWelist();
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            })
          }
        } else if (e.cancel) { }
      }
    })
  },
  // 解绑
  async unBindwe() {
    const payload = {};
    payload.type = 0;
    payload.username = this.data.userName;
    wx.showModal({
      title: '解绑微信',
      confirmColor: '#666',
      content: '是否解绑微信',
      success: async (e) => {
        if (e.confirm) {
          const res = await request.putRequest(api.bind+'?'+qs.stringify(payload));
          console.log(res);
          if (res.result) {
            wx.showToast({
              icon: 'success',
              title: '解绑微信成功',
            })
            this._getWelist();
          } else {
            wx.showToast({
              title: res.message,
              icon: 'none'
            })
          }
        } else if (e.cancel) { }
      }
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
  }
});
