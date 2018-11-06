import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    account: '',
    password: '',
    isshow: true,
    hasChecked: '下次自动登录',
    checked: false,
    checkedValue: 'checked'
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      account: {
        required: true,
        rangelength: [1, 16]
      },
      password: {
        required: true,
        rangelength: [6, 12]
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      account: {
        required: '用户名不能为空',
        rangelength: '用户名为1-16位',
      },
      password: {
        required: '密码不能为空',
        rangelength: '密码长度为6-12位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.initValidate()
  },
  toLogin: function (e) {
    console.log(e)
    const that = this;
    if (!that.WxValidate.checkForm(e)) {
      const error = that.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    const params = { account: e.detail.value.account, password: e.detail.value.password, rememberMe: true };
    wx.showLoading({
      title: '正在登录...',
      mask: true
    })
    setTimeout(()=> {
      wx.hideLoading()
    },6000)
    request.postRequest(api.login, {
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
      .then(res => {
        console.log(res)
        if (res.result) {
          setTimeout(()=> {
            app.globalData.userInfo = res.data;
            wx.navigateTo({ url: '../index/index' })
            wx.hideLoading();
          },1000)
        } else {
          wx.hideLoading();
          wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
          })
        }
      })

  },
  isshowPwd() {
    var isshow = !this.data.isshow;
    this.setData({
      isshow: isshow
    });
  },
  checkboxChange: function(e) {
    console.log('checkbox发生change事件，携带value值为：', e)
  }
})