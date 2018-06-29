import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    planDepartureTimeBefore:'',
    planDepartureTimeAfter:'',
    monthstart:'',
    monthend:'',
    todaynum:'',
    monthnum:'',
    username: '',
    grids: [
      { title: '车辆检测', pageUrl: '../carRepair/carRepair', imageUrl:'../image/rpair@2x.png' },
      { title: '生成调令', pageUrl:'../createDispatch/createDispatch',imageUrl:'../image/move@2x.png' },
      { title: '借款审核', pageUrl: '../borrowMoney/borrowMoney', imageUrl:'../image/borrow@2x.png' },
      { title: '在途维修', pageUrl: '../onwayRepair/onwayRepair', imageUrl:'../image/way@2x.png' },
      { title: '请假审核', pageUrl: '../driverLeave/driverLeave', imageUrl:'../image/leave@2x.png' },
      { title: '单据审核', pageUrl: '../documentReview/documentReview', imageUrl:'../image/type@2x.png' }
    ]
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    let endtiem = moment().format('YYYY-MM-DD')
    let starttiem = moment().format('YYYY-MM-DD')
    let year = moment().format('YYYY');
    let month = moment().format('MM');

    let aMonth = moment().add(1, 'months');
    let endmonth = moment(aMonth).format('MM');

    this.setData({
      username: app.globalData.userInfo.realName,
      planDepartureTimeBefore: endtiem + " " + '23:59:59',
      planDepartureTimeAfter: starttiem + " " + '00:00:00',
      monthstart: year + "-" + month + '-01 00:00:00',
      monthend: year + "-" + endmonth + '-01 00:00:00'
    })
    let params = {
      planDepartureTimeBefore: this.data.planDepartureTimeBefore,
      planDepartureTimeAfter: this.data.planDepartureTimeAfter
    }
    let payload = {
      planDepartureTimeBefore: this.data.monthend,
      planDepartureTimeAfter: this.data.monthstart
    }
    this.getwabytodayNum(params)
    this.getwabymonthNum(payload)
  },
  getwabytodayNum(params){
    request.getRequest(api.waybillCount, {
      data: params
    })
    .then(res => {
      this.setData({
        todaynum:res.data
      })
    })
  },
  getwabymonthNum(params) {
    request.getRequest(api.waybillCount, {
      data: params
    })
      .then(res => {
        this.setData({
          monthnum: res.data
        })
      })
  }
})
