// pages/history/history.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;

Page({
    data: {
        pageNo: 1,
        pageSize: 500,
        reportList: [], // 上报单据的列表
        statusList: [],
        wayNum: null
    },
    async getReportList() {
        let page = this;
        console.log()
        const params = {
            pageNo: page.data.pageNo,
            pageSize: page.data.pageSize,
            waybillNum: page.data.wayNum
        }
        const res = await request.getRequest(api.eventList,{data: params})
        if (res.result) {
          // 获取上报单据列表成功
          const reportList = res.data || [];
          await this.getDict();
          reportList.forEach(item=> {
            item.createTime = this.etDateStr(item.createTime);
          })
          page.setData({
              reportList: reportList
          });
      } else {
        wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
        });
      }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      this.setData({
        wayNum: options.wayNum
      })
      this.getReportList();  
    },
    // 时间格式转换
    etDateStr(day) {
      const dd = new Date(day);
      dd.setDate(dd.getDate());
      const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
      const d = dd.getDate() > 9 ? dd.getDate() : '0' + dd.getDate();
      const hh = dd.getHours() > 9 ? dd.getHours() : '0' + dd.getHours();
      const mm = dd.getMinutes() > 9 ? dd.getMinutes() : '0' + dd.getMinutes();
      return m + '-' + d + ' ' + hh + ':' + mm;
    },
    // 获取单据类型字典
    async getDict() {
      let page = this;
      const oneList = (await request.getRequest(api.dictApi, {
        data: { key: 'mileage' }
      })).data
      const twoList = (await request.getRequest(api.dictApi, {
        data: { key: 'fuel_subsidy' }
      })).data
      const threeList = (await request.getRequest(api.dictApi, {
        data: { key: 'expenses' }
      })).data
      const statusList = [...new Set([...oneList, ...twoList, ...threeList])];
      page.setData({
        statusList: statusList
      })
    }
})