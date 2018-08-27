import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    pageNo: 1,
    pageSize: 10,
    borrowList: [],
    wayNum: null
  },
  onLoad(option) {
    var that = this;
    this._getBorrow();
    this._getWayInfo();
  },
  // 借款的tab
  async _getBorrow() {
    const res = (await request.getRequest(api.applyList,{data:{ pageNo: this.data.pageNo, pageSize: this.data.pageSize}})).data;
    res.forEach(item=> {
      item.money = (item.money*0.01).toFixed(1);
      item.examineMoney = (item.examineMoney*0.01).toFixed(1);
      item.createTime = this.etDateStr(item.createTime.replace(/\-/g, '/'));
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
        case 4:
        item.examineStatus = '已打款'
        break;
        case 5:
        item.examineStatus = '已还款'
        break;
        case 6:
        item.examineStatus = '已作废'
        break;
      }
    })
    this.setData({
      borrowList: res
    })
  },
  // 获取当前的调度单
  async _getWayInfo() {
    let page = this;
    const res = await request.getRequest(api.currentWaybil)
    if (res.result) {
      // 获取调度信息
      const wayInfo = res.data || {};
      page.setData({
        wayInfo: wayInfo,
        wayNum: wayInfo.waybillNum,
      });
    } else {
      wx.showModal({
        confirmColor: '#666',
        content: res.message,
        showCancel: false,
      });
    }
  },
  // 跳转到申请界面
  goApply () {
    if (this.data.wayNum) {
      wx.navigateTo({
        url: '../addApply/addApply?wayNum=' + this.data.wayNum,
      })
    } else {
      wx.showToast({
        title: '当前没有运输中调度单，无法申请借款',
        icon: 'none',
        duration: 1000
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
    await this._getBorrow();
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
    await this._getBorrow();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },
  // 取消按钮
  async cancelAdd(e) {
    const id = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.cancelApply,{data:{id: id}})
    console.log(res);
    if (res.result) {
      wx.showToast({
        icon: 'success',
        title: '取消申请借款成功',
      })
      this._getBorrow();
    } else {
      wx.showToast({
        icon: 'success',
        title: '取消申请借款失败',
      })
    }
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
