import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    phone: null,
    clear: true
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      phone: {
        required: true,
        tel: true,
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      phone: {
        required: '手机号不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.initValidate();
    this.setData({
      phone: options.phone
    })
  },
  // 提交密码
  async changePass(e) {
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
    const res = await request.postRequest(api.updatadriver + '?phone=' + this.data.phone)
    if (res.result) {
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        success: () => {
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];  //上一个页面
          prevPage._getDriver();
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 500)
        }
      })
    } else {
      console.log(res)
      wx.showToast({
        title: res.message,
        icon: 'none'
      })
    }
  },
  // 手机号输入框
  phone(e) {
    if (e.detail.value) {
      this.setData({
        phone: e.detail.value,
        clear: true
      })
    } else {
      this.setData({
        phone: e.detail.value,
        clear: false
      })
    } 
  },
  clear() {
    this.setData({
      phone: '',
      clear: false
    })
  }
})