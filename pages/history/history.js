// pages/history/history.js
import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;

Page({
    data: {
        pageNo: 1,
        pageSize: 10,
        historys: [], // 历史列表
        gray: false,
        wayId: null
    },
    getHistorys() {
      let page = this;
      const params = {
        pageNo: page.data.pageNo,
        pageSize: page.data.pageSize
      }
      request.getRequest(api.history,{
          data: params
      }).then(res => {
        if (res.result) {
          // 获取历史任务成功
          console.log('historys', res);
          const historys = res.data || [];
          historys.forEach(item=> {
            item.taskDetails.forEach(site=> {
              site.topTime = site.scheduleTime;
              if (site.arriveTime) {site.arriveTime = this.etDateStr(site.arriveTime);}
              if (site.scheduleTime) {site.scheduleTime = this.etDateStr(site.scheduleTime);}
              if (site.topTime) {site.topTime = this.etTopTime(site.topTime);}
            })
          })
          page.setData({
              historys: historys
          });
        } else {
          wx.showModal({
            confirmColor: '#666',
            content: res.message,
            showCancel: false,
          });
        }
      })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getHistorys();
    },
    auditD (e) {
      const wayId= e.currentTarget.dataset.id;
      const status = e.currentTarget.dataset.status;
      if (status === 5) {
        wx.showModal({
          title: '提交审批',
          confirmColor: '#666',
          content: '是否提交审批',
          success: async (e) => {
            if (e.confirm) {
              const res = await request.postRequest(api.subAudit,{
                data:{id: wayId}
              })
              if (res.result){
                wx.showToast({
                  icon: 'none',
                  title: '提交审批成功'
                })
                this.setData({
                  gray: true
                })
              } else {
                wx.showToast({
                  icon: 'none',
                  title: '提交审批失败'
                })
              }
            } else if (e.cancel) {
  
            }
          }
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '未确认送达不能提交审批'
        })
      }
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
    // topTime时间格式转换
    etTopTime(day) {
      const dd = new Date(day);
      dd.setDate(dd.getDate());
      const y = dd.getFullYear();
      const m = dd.getMonth() + 1 > 9 ? dd.getMonth() + 1 : '0' + (dd.getMonth() + 1);
      return y + '年' + m + '月';
    },
})