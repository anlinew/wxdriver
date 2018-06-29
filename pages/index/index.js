// pages/dispatchDetail/dispatchDetail.js
// export const updateFun = (opt, payload) => fetch.post(apiFormat(updateApi, opt), payload);
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';

const app = getApp()
const request = app.WxRequest;

Page({
  data: {
    detail: {}
  },
  onLoad(options) {
    this.getWaybil();
  },
  getWaybil() {
    request.getRequest(api.currentWaybil).then(res => {
      this.setData({
        detail: res.data
      });
    })
  }
})