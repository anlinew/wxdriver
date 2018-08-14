// pages/history/history.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;

Page({
    data: {
        pageNo: 1,
        pageSize: 10,
        reportList: [], // 上报单据的列表
        statusList: [],
        wayNum: null,
        visible: false
    },
    async getReportList() {
        let page = this;
        console.log()
        const params = {
            pageNo: page.data.pageNo,
            pageSize: page.data.pageSize,
            waybillNum: page.data.wayNum
        }
        const res = await request.getRequest(api.eventList,{data: params})
        if (res.result) {
          // 获取上报单据列表成功
          const reportList = res.data || [];
          reportList.forEach(item=> {
            item.createTime = this.etDateStr(item.createTime);
          })
          page.setData({
              reportList: reportList
          });
      } else {
        wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
        });
      }
    },
    onLoad: function(options) {
      this.setData({
        wayNum: options.wayNum
      })
      this.getReportList();  
    },
      // 显示模态框
    handleOpen(e) {
      console.log(e);
      const imgids = e.currentTarget.dataset.imgids.split(',');
      const urls = imgids.map((item)=> item = 'http://182.61.48.201:8080/api/pub/objurl/name?id='+item+'&compress=true')
      console.log(urls);
      this.setData({
        visible: true,
        imgList: urls
      });
    },
    // 点击叉叉关闭模态框
    closeMadol() {
      this.setData({
        visible: false,
        imgList: []
      })
    },
    // 点击图片放大预览
    imgTap(e) {
      console.log(e);
      // 为压缩的图片列表
      const imgList = this.data.imgList.map(item=> item = item.replace('true', 'false'))
      const current = e.currentTarget.dataset.current.replace('true', 'false')
      wx.previewImage({
        current: current,
        urls: imgList
      })
    },
    // 取消上报
    async cancelReport(e) {
      const id = e.currentTarget.dataset.id;
      const res = await request.postRequest(api.cancelEvent + '?id=' + id)
      if (res.result) {
        wx.showToast({
          icon: 'none',
          title: '取消上报成功'
        })
        this.getReportList();
      } else {
        wx.showToast({
          icon: 'none',
          title: '取消上报失败'
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
    await this.getReportList();
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
    await this.getReportList();
    setTimeout(()=> {
      wx.hideLoading();
      wx.showToast({
        title: '加载完毕',
        icon: 'none'
      })
    },500)
  },
    // 跳转到申请借款的页面
    applyB() {
      wx.navigateTo({
        url: '../addApply/addApply'
      })
    },
    // 联系催人
    call_people() {
      wx.makePhoneCall({
        phoneNumber: '02788996666'
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
})