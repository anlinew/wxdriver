// pages/historySearch/historySearch.js
import moment from '../../utils/moment.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startDate: "开始日期",
    endDate: "结束日期",
    waybillNum: null,
    fromCity: '',
    toCity: '',
    fromId: null,
    toId: null,
    clear: false,
    days:[{day: '最近7天', data:7},{day: '最近15天', data: 15},{day: '最近30天', data:30}],
    current: ''
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
  },
  // 跳转到城市页面
  goCity(e) {
    console.log(e.currentTarget.dataset.type)
    wx.navigateTo({
      url: '../cities/cities?type=' + e.currentTarget.dataset.type
    })
  },
  // 输入调度单号
  wayNum(e) {
    console.log(e.detail.value);
    this.setData({
      waybillNum: e.detail.value
    })
    if (e.detail.value) {
      this.setData({
        clear: true
      })
    } else {
      this.setData({
        clear: false
      })
    }
  },
  // 清空输入框
  clearInput(e) {
    console.log(e);
    this.setData({
      waybillNum: ''
    })
  },
  // 点击确定搜索
  search() {
    const payload = {};
    if (this.data.startDate !== '开始日期') {payload.planDepartureTimeAfter = this.data.startDate + ' 00:00:00';}
    if (this.data.endDate !== '结束日期') {payload.planDepartureTimeBefore = this.data.endDate + ' 23:59:59';}
    if (this.data.fromCity) {payload.fromCity = this.data.fromId;}
    if (this.data.toCity) {payload.toCity = this.data.toId;}
    if (this.data.waybillNum) {payload.waybillNum = this.data.waybillNum;}
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];  //上一个页面
    prevPage.setData({
      payload: payload
    })
    // 触发上个页面的方法
    prevPage.getHistorys(payload);
    setTimeout(() => {
      wx.navigateBack({
        delta: 1
      })
    }, 300);
  },
  chooseDay(e) {
    const data = e.currentTarget.dataset.data
    this.setData({
      current: e.currentTarget.dataset.index,
      startDate: moment().add(-data,'day').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
    })
  }
})