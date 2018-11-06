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
    pageSize:10,
    reportList: [], // 上报单据的列表
    statusList: [],
    wayNum: null,
    visible: false,
    imgList: [],
    jiahaoImg: '../image/jiahao.png'
  },
  async getReportList() {
    wx.showLoading({
      title: '数据加载中',
      mask: true
    })
    let page = this;
    const params = {
      pageNo: page.data.pageNo,
      pageSize: page.data.pageSize,
      waybillNum: page.data.wayNum
    }
    const res = await request.getRequest(api.reportList, { data: params })
    if (res.result) {
      // 获取上报单据列表成功
      const reportList = res.data || [];
      await this.getDict();
      reportList.forEach(item => {
        item.createTime = this.etDateStr(item.createTime.replace(/\-/g, '/'));
        item.status = this.data.statusList.find((n) => n.rank === item.status).label;
        if (item.unit === '元') {
          item.money = (item.money * 0.01).toFixed(2);
        }
      })
      page.setData({
        reportList: reportList
      });
      setTimeout(function(){
        wx.hideLoading()
      },300)
    } else {
      wx.showModal({
        confirmColor: '#666',
        content: res.message,
        showCancel: false,
      });
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      wayNum: options.wayNum
    })
    this.getReportList();
  },
  // 取消上报
  async cancelReport(e) {
    const id = e.currentTarget.dataset.id;
    const res = await request.postRequest(api.cancelReport + '?id=' + id)
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
  // 显示模态框
  handleOpen(e) {
    const imgids = e.currentTarget.dataset.imgids.split(',');
    const urls = imgids.map((item) => item = 'http://118.25.119.212/api/pub/objurl/name?id=' + item + '&compress=true')
    // const urls = imgids.map((item)=> item = 'http://boyu.cmal.com.cn/api/pub/objurl/name?id='+item+'&compress=true')
    // const urls = imgids.map((item) => item = 'http://182.61.48.201:8080/api/pub/objurl/name?id=' + item + '&compress=true')
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
    // 为压缩的图片列表
    const imgList = this.data.imgList.map(item=> item = item.replace('true', 'false'))
    const current = e.currentTarget.dataset.current.replace('true', 'false')
    wx.previewImage({
      current: current,
      urls: imgList,
      success: function(res){
        console.log(res)
      }
    })
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
        icon: 'none',
        duration: 500
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
        icon: 'none',
        duration: 500
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
  // 图片加载完后的方法
  loadimg() {
    console.log(1111)
  },
  // 获取单据类型字典
  async getDict() {
    let page = this;
    const oneList = (await request.getRequest(api.dictApi, {
      data: { key: 'mileage' }
    })).data
    const twoList = (await request.getRequest(api.dictApi, {
      data: { key: 'fuel_subsidy' }
    })).data
    const threeList = (await request.getRequest(api.dictApi, {
      data: { key: 'expenses' }
    })).data
    const statusList = [...new Set([...oneList, ...twoList, ...threeList])];
    page.setData({
      statusList: statusList
    })
  }
})