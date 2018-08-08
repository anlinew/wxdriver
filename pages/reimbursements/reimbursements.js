// pages/reimbursements/reimbursements.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;
var startY,endY,moveY,differ;
var moveTopValue = 0;
Page({
  data: {
    animation: '',
    animation_head: '',
    moveTop: 0,
    startTop: 0,
    tatolObj: {},
    timeNow: null,
    dateNow: null,
    loanList: []
  },
  onLoad: function (options) {
    const timeNow = this.etTimeNow(new Date());
    const dateNow = this.etDateNow(new Date());
    this.setData({
      timeNow: timeNow,
      dateNow: dateNow,
      wayNum: options.wayNum
    })
    this._getTatol();
    this._getLoanList();
  },
  onReady: function() {
    // 手指移动的动画
    this.animation = wx.createAnimation({
      timingFunction: 'linear',
      duration: 0,
      delay: 0,
      transformOrigin: 'left top 0',
      success: function(res) {
        console.log(res)
      }
    })
    // 改变透明度的动画
    this.animation_head = wx.createAnimation({
      timingFunction: 'linear',
      duration: 300,
      delay: 0,
      transformOrigin: 'left top 0',
      success: function(res) {
        console.log(res)
      }
    })
  },
  // 获取报销的tatol
  async _getTatol() {
    const res = (await request.getRequest(api.loanTotal)).data;
    res.applyMoney = Math.round(res.applyMoney*0.01);
    res.loanCount = Math.round(res.loanCount*0.01);
    res.totalCount = Math.round(res.totalCount*0.01);
    res.examineMoney = Math.round(res.examineMoney*0.01);
    this.setData({
      tatolObj: res
    })
  },
  // 获取报销的列表
  async _getLoanList() {
    const payload = {pageNo:1, pageSize:10};
    const res = await request.getRequest(api.loanList,{data: payload});
    const loanList = res.data;
    loanList.forEach(n=> {
      n.billApplyMoney = (n.billApplyMoney*0.01).toFixed(2);
      n.payLoanExamineMoney = (n.payLoanExamineMoney*0.01).toFixed(2);
      n.taskDetails.forEach(item=>{
        if (item.arriveTime){item.arriveTime = this.etDateNow(item.arriveTime );}
        if (item.scheduleTime){item.scheduleTime = this.etDateNow(item.scheduleTime );}
      })
    })
    this.setData({
      loanList: loanList
    })
  },
  // 下面为滑动的动画
  touchStart(e) {
    startY = e.touches[0].pageY;
    
  },
  touchMove(e) {
    moveY = e.touches[0].pageY;
    // 滑动的距离s
    differ = moveY - startY;
    moveTopValue = this.data.startTop + differ
    this.setData({
      moveTop: this.data.startTop + differ + 'px'
    })
    // 向上移动的最大距离为280rpx
    if (moveTopValue>=-125) {
      this.animation_head.opacity((125+differ)/125).step();
      this.setData({
        animation_head: this.animation_head.export()
      })
      // 向下移动
    }else if (moveTopValue<0){
      this.animation_head.opacity(differ/125).step();
      this.setData({
        animation_head: this.animation_head.export()
      })
    }
  },
  touchEnd(e) {
    if (differ<-20) {
      this.animation_head.opacity(0).step();
      moveTopValue = -125
      this.setData({
        animation_head: this.animation_head.export(),
        moveTop: '-125px',
        startTop: -125,
        
      })
    } else if (differ>20) {
      this.animation_head.opacity(1).step();
      moveTopValue = 0
      this.setData({
        animation_head: this.animation_head.export(),
        moveTop: '0px',
        startTop: 0,
      })
    }
  },
  // timeNow时间格式转换
  etTimeNow(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
    const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
    return hh + ':' + mm;
  },
  // dateNow时间格式转换
  etDateNow(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const y = dd.getFullYear();
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    return y + '-' + m + '-' + d;
  },
})