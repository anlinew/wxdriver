import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
// import qs from '../../plugins/qs.js';

const app = getApp()
const request = app.WxRequest;

var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置

Page({
  data: {
    tabs: ["签批", "燃油", '标准', '借款'],
    activeIndex: '0',
    sliderOffset: 0,
    sliderLeft: 0,
    pageNo: 1,
    pageSize: 500,
    reportList: [], // 上报单据的列表
    statusList: [],
    wayNum: null,
    billApplyMoney: null,
    billApplyGas: null,
    billApplyMileage: null,
    billExamineMoney: null,
    billExamineGas: null,
    billExamineMileage: null,
    id: null,
    oilObj: {},
    standard: [],
    sum: null,
    borrowList: [],
    applyMoney: null,
    exaimMoney: null,
    oilSumMoney: null
  },
  onLoad(option) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    that.setData({
      wayNum: option.wayNum,
      billApplyMoney: option.billApplyMoney,
      billApplyGas: option.billApplyGas,
      billApplyMileage: option.billApplyMileage,
      billExamineMoney: option.billExamineMoney,
      billExamineGas: option.billExamineGas,
      billExamineMileage: option.billExamineMileage,
      id: option.id
    })
    console.log(option)
    that._getReportList();
    this._getOil();
    this._getStandard();
    this._getBorrow();
  },
  tabClick: function (e) {
    console.log(e);
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },
  // 签批tab的js
  async _getReportList() {
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
        item.createTime = this.etDateStr(item.createTime);
        item.status = this.data.statusList.find((n) => n.rank === item.status).label;
        item.money = (item.money*0.01).toFixed(1)
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
  // 燃油的tab
  async _getOil() {
    const res = (await request.getRequest(api.oilList,{data:{settlementDetailId: this.data.id}})).data;
    console.log(res);
    // 里程类的合计和金额
    res.mileageSum = res.routeMileage+res.detourMileage+res.freightMileage;
    res.mileageMoney = (res.mileageSum*0.01*res.gasConsumeSetting*(res.gasPrice/100)).toFixed(1);
    // 最下面补贴类的(升)
    res.btSum = res.mountSoadSubsidy+res.loadTruckFee+res.specialSiteSubsidy;
    res.btMoney = (res.btSum*(res.gasPrice/100)).toFixed(1);
    // 费用类的合计
    res.fySum = ((res.carTrialOilSubsidy + res.winterOilSubsidy)*0.01).toFixed(1);
    // 所有费用的合计
    res.oilSumMoney = (res.btSum*(res.gasPrice/100) + res.mileageSum*0.01*res.gasConsumeSetting*(res.gasPrice/100) +((res.carTrialOilSubsidy + res.winterOilSubsidy)*0.01)).toFixed(1);
    // 单独费用
    res.carTrialOilSubsidy = (res.carTrialOilSubsidy*0.01).toFixed(1);
    res.winterOilSubsidy = (res.winterOilSubsidy*0.01).toFixed(1);
    
    this.setData({
      oilObj: res
    })
  },
  // 标准的tab
  async _getStandard() {
    const res = (await request.getRequest(api.subsidy,{data:{settlementDetailId: this.data.id}})).data;
    var sum = 0;
    console.log(res);
    if (res) {
      res.forEach(item=> {
        sum+=item.count;
        item.count = (item.count*0.01).toFixed(1);
        item.suibmitTime = this.etDateStr(item.suibmitTime);
      })
      this.setData({
        standard: res,
        sum: (sum*0.01).toFixed(1)
      })
    }
  },
  // 借款的tab
  async _getBorrow() {
    const res = (await request.getRequest(api.applyList,{data:{waybillNum: this.data.wayNum, pageNo:1, pageSize: 500}})).data;
    var applyMoney = 0;
    var exaimMoney = 0;
    res.forEach(item=> {
      applyMoney+=item.money;
      exaimMoney+=item.examineMoney;
      item.money = (item.money*0.01).toFixed(1);
      item.examineMoney = (item.examineMoney*0.01).toFixed(1);
      item.createTime = this.etDateStr(item.createTime);
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
      borrowList: res,
      applyMoney: (applyMoney*0.01).toFixed(1),
      exaimMoney: (exaimMoney*0.01).toFixed(1)
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    if (this.data.activeIndex === '0'){
      this.data.pageNo = 1;
      this.data.pageSize = 10;
      wx.showLoading({
        title: '加载中...',
      })

      await this._getReportList();
      setTimeout(()=> {
        wx.stopPullDownRefresh();
        wx.hideLoading();
        wx.showToast({
          title: '加载完毕',
          icon: 'none'
        })
      },500)
    } else if (this.data.activeIndex === '3') {
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
    }
  },
  // 上拉加载更多
  async onReachBottom() {
    if (this.data.activeIndex === '0') {
      wx.showLoading({
        title: '加载更多中...',
      })
      this.data.pageSize = this.data.pageSize + 10;
      await this._getReportList();
      setTimeout(()=> {
        wx.hideLoading();
        wx.showToast({
          title: '加载完毕',
          icon: 'none'
        })
      },500)
    } else if (this.data.activeIndex === '3') {
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
});
