// pages/uploadReport/uploadReport.js
import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;
Page({
  data: {
    description: '',
    reasonList: ['小孩生病去医院', '家里有急事需处理', '朋友结婚', '家人生病', '请审批', '谢谢'],
    dateStart: null,
    dateEnd: null
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      dateStart: {
        required: true
      },
      dateEnd: {
        required: true
      },
      description: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      dateStart: {
        required: '开始时间不能为空'
      },
      dateEnd: {
        required: '结束时间不能为空'
      },
      description: {
        required: '请假事由不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.initValidate();
    this._getDriverInfo();
    this.setData({
      dateStart: this.etYearStr(new Date()),
      dateEnd: this.etYearStradd(new Date())
    })
  },
  // 获取司机的信息
  async _getDriverInfo() {
    const res = (await request.getRequest(api.driverInfo)).data;
    this.setData({
      id: res.id
    })
  },
  // 点击提交申请请假
  async acceptTask(e) {
    // 校验字段
    console.log(e);
    if (!this.WxValidate.checkForm(e)) {
      console.log(this.WxValidate.errorList)
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    const payload = {};
    // 请假的原因
    payload.description = this.data.description;
    // 请假的天数
    payload.duration = Math.floor((Date.parse(this.data.dateEnd) - Date.parse(this.data.dateStart)) / (24 * 3600 * 1000))
    // 司机id
    payload.driverId = this.data.id;
    // startTime
    payload.startTime = this.dateFormat(this.data.dateStart.replace(/\-/g, '/'));
    // endTime
    payload.endTime = this.dateFormat(this.data.dateEnd.replace(/\-/g, '/'));
    const res = await request.postRequest(api.addLeave,{
      data: payload,
      header: {
        'Content-Type': 'application/json'
      }
    })
    console.log(res);
    if (res.result) {
      wx.showToast({
        icon: 'success',
        title: '申请请假成功',
        duration: 700,
        success:(res)=>{
          setTimeout(()=>{
            prevPage._getLeave();
            wx.navigateBack({
              delta: 1,
              success: (res) => {
                console.log(res)
              }
            })
          },700)
        }
      })
      let pages = getCurrentPages(); //当前页面
      let prevPage = pages[pages.length-2]; //上一页面
      // prevPage._getLeave();
      // wx.navigateBack({
      //   delta: 1,
      //   success: (res) => {
      //     console.log(res)
      //   }
      // })
    } else {
      wx.showToast({
        title: res.message,
        icon: 'none'
      })
    }
  },
  inputD(e) {
    this.setData({
    description: e.detail.value
    })
  },
  // 选择日期
  startChange(e) {
    this.setData({
      dateStart: e.detail.value
    })
  },
  endChange(e) {
    this.setData({
      dateEnd: e.detail.value
    })
  },
  reasonClick(e) {
    const current = e.currentTarget.dataset.index;
    if (this.data.description) {
      this.setData({
        description: this.data.description + ',' + this.data.reasonList[current]
      })
    } else {
      this.setData({
        description: this.data.description + this.data.reasonList[current]
      })
    }
  },
  // 时间格式转换(年和月)
  etYearStr(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const y = dd.getFullYear();
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    return y + '-' + m + '-' + d;
  },
  // 时间格式转换(年和月  日加一天)
  etYearStradd(day) {
    const dd = new Date(day);
    dd.setDate(dd.getDate());
    const y = dd.getFullYear();
    const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
    const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
    return y + '-' + m + '-' + (d+1);
  },
  // 格式转化为yy-MM-dd hh:mm:ss
  dateFormat(day) {
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
})