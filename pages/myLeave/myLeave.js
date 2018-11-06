import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    borrowList: [],
    pageNo: 1,
    pageSize: 10,
    jiahaoImg: '../image/jiahao.png'
  },
  onLoad(option) {
    var that = this;
    this._getLeave();
  },
  // 请假的列表
  async _getLeave() {
    const res = (await request.getRequest(api.leaveList,{data:{ pageNo:this.data.pageNo, pageSize: this.data.pageSize}})).data;
    res.forEach(item=> {
      item.money = (item.money*0.01).toFixed(1);
      item.examineMoney = (item.examineMoney*0.01).toFixed(1);
      item.createTime = this.etDateStr(item.createTime.replace(/\-/g, '/'));
      item.startTime = this.etYearStr(item.startTime.replace(/\-/g, '/'));
      item.endTime = this.etYearStr(item.endTime.replace(/\-/g, '/'));
      if (!item.examineRemark){item.examineRemark='无'}
      switch(item.examineStatus){
        case 0:
        item.examineStatus = '待审批'
        break;
        case 2:
        item.examineStatus = '已批准'
        break;
        case 3:
        item.examineStatus = '已驳回'
        break;
      }
    })
    this.setData({
      borrowList: res
    })
  },
  // 取消按钮
  async cancelAdd(e) {
    const id = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.cancelLeave,{data:{id: id}})
    console.log(res);
    if (res.result) {
      wx.showToast({
        icon: 'success',
        title: '取消申请请假成功',
      })
      this._getLeave();
    } else {
      wx.showToast({
        icon: 'success',
        title: '取消申请请假失败',
      })
    }
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    this.data.pageNo = 1;
    this.data.pageSize = 10;
    wx.showLoading({
      title: '加载中...',
    })
    await this._getLeave();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },
  // 上拉加载更多
  async onReachBottom() {
    wx.showLoading({
      title: '加载更多中...',
    })
    this.data.pageSize = this.data.pageSize + 10;
    await this._getLeave();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },
  // 更换加号图片
  jTouchstart (e) {
    console.log(e)
    this.setData({
      jiahaoImg: '../image/jiahao2.png'
    })
  },
  jTouchend () {
    setTimeout(()=> {
      this.setData({
        jiahaoImg: '../image/jiahao.png'
      })
    }, 300)
  },
  // 时间格式转换(月份和时间)
  etDateStr(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
    const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
    return m + '-' + d + ' ' + hh + ':' + mm;
  },
  // 时间格式转换(年和月)
  etYearStr(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const y = dd.getFullYear();
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    return y + '-' + m + '-' + d;
  }
});
