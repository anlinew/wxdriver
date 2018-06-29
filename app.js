import WxRequest from './plugins/wx-request/lib/index'
import utils from './utils/util.js'
App({
  onLaunch: function () {
    this.WxRequest()
  },
  globalData: {
    userInfo: {}
  },
  WxRequest(){
    this.WxRequest = new WxRequest({
      baseURL: 'http://182.61.48.201:8080',
    })
    this.interceptors()
    return this.WxRequest;
  },
  interceptors() {
    this.WxRequest.interceptors.use({
      request(request) {
        const token = wx.getStorageSync('token');
        if (token) {
          request.header['X-Auth-Token'] = token;
        }
        return request
      },
      requestError(requestError) {
        wx.hideLoading()
        return Promise.reject(requestError)
      },
      response(response) {
        const token = response.header['X-Auth-Token']
        if (token) {
          response.data.token = token;
          wx.setStorageSync('token', token);
        }
        if (response.statusCode === 200) {
          return Promise.resolve(response.data);
        } else {
          console.log('请求错误' + response.data.message)
          return Promise.reject(response.data);
        }
        return response
      },
      responseError(responseError) {
        wx.hideLoading()
        return Promise.reject(responseError)
      },
    })
  }
})