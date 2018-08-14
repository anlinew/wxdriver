import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    password: null,
    newPassword: null,
    aginPassword: null
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      password: {
        required: true
      },
      newPassword: {
        required: true
      },
      aginPassword: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      password: {
        required: '原密码不能为空'
      },
      newPassword: {
        required: '新密码不能为空'
      },
      aginPassword: {
        required: '再次输入新密码不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
   this.initValidate();
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
    if (this.data.newPassword === this.data.aginPassword) {
      const res = await request.postRequest(api.changePass + '?password=' + this.data.password +'&newPassword='+this.data.newPassword)
      console.log(res);
      if (res.result) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          success:() => {
            setTimeout(() => {
              wx.navigateTo({
                url: '../login/login',
              })
            }, 800)
          }
        })
      } else {
        wx.showToast({
          title: '修改密码失败',
          icon: 'none'
        })
      }
    } else {
      wx.showModal({
        title: '',
        showCancel: false,
        confirmColor: '#666',
        content: '两次密码输入不一致，请重新输入',
      })
    }
  },
  oldPass(e) {
    this.setData({
      password: e.detail.value
    })
  },
  newPass(e) {
    this.setData({
      newPassword: e.detail.value
    })
  },
  aginPass(e) {
    this.setData({
      aginPassword: e.detail.value
    })
  }
})