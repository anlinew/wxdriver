// pages/uploadReport/uploadReport.js
import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;
var qqmapsdk;
Page({
  data: {
    wayInfo: {},
    wayNum: null,
    description: '',
    money: null,
    typeValue: '在途补油',
    typeList: ['在途补油', '在途借款', '事故借款', '其他'],
    reasonList: ['申请在途补油借款', '申请在途借款', '车辆事故借款', '请参考附件图片', '请审批', '谢谢'],
    currentT: 0,
    currentR: null
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      money: {
        required: true,
        number: true,
      },
      description: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      money: {
        required: '借款金额不能为空',
        digits: '借款金额只能输入数字',
      },
      description: {
        required: '借款原因不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this._getWayInfo();
    this.initValidate();
  },
  // 新增上报时获取调度信息
  async _getWayInfo() {
    let page = this;
    const res = await request.getRequest(api.currentWaybil)
    if (res.result) {
      // 获取调度信息
      const wayInfo = res.data || {};
      console.log(this.data.wayInfo)
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
  // 点击提交上报单据
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
    wx.showLoading({
      title: '正在提交申请...',
      mask: true,
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 5000)
    const payload = {};
    // 上报的描述
    payload.description = this.data.description;
    // 上报的金额
    payload.money = (this.data.money*100);
    // 上报的类型、中文
    payload.type = this.data.currentT + 1;
    payload.typeName = this.data.typeValue;
    // 调度单id
    payload.waybillNum = this.data.wayNum;
    const res = await request.postRequest(api.addApply,{
      data: payload,
      header: {
        'Content-Type': 'application/json'
      }
    })
    if (res.result) {
      let pages = getCurrentPages();//当前页面
      let prevPage = pages[pages.length-2];//上一页面
      setTimeout(()=> {
        prevPage._getBorrow();
        wx.navigateBack({
          delta: 1,
          success: (res) => {
            console.log(res)
          }
        })
        wx.showToast({
          icon: 'success',
          title: '提交申请成功',
        })
      },1000)
    } else {
      wx.showToast({
        title: res.message,
        icon: 'none'
      })
    }
  },
  inputM(e) {
    this.setData({
      money: e.detail.value
    })
    console.log(this.data.money)
  },
  inputD(e) {
    this.setData({
    description: e.detail.value
    })
  },
  // 点击按钮变蓝
  typeClick(e) {
    const current = e.currentTarget.dataset.index;
    this.setData({
      currentT: current,
      typeValue: this.data.typeList[current]
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
  }
})