import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    account:'',
    password :'',
    isshow:true,
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      account: {
        required: true,
        tel: true
      },
      password: {
        required: true,
        rangelength: [6, 12]
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      account: {
        required: '手机号码不能为空',
        tel: '请输入正确的手机号',
      },
      password: {
        required: '密码不能为空',
        rangelength:'密码长度为6-12位'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    this.initValidate()
  },
  tologin(e) {
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
    const params = { account: e.detail.value.account, password: e.detail.value.password };
    request.postRequest(api.login, {
      data: params,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    .then(res => {
      if(res.result){
        wx.showModal({
          confirmColor: '#666',
          content: '登录成功',
          showCancel: false,
        })
        app.globalData.userInfo = res.data;      
        wx.navigateTo({url: '../index/index'})
      }else{
        wx.showModal({
          confirmColor: '#666',
          content: res.message,
          showCancel: false,
        })
      }
    })
  },
  isshowPwd(){
    var isshow = !this.data.isshow;
    this.setData({
      isshow: isshow
    });  
  }
})