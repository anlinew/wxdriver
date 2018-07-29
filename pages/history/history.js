// pages/history/history.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pageNo: 1,
        pageSize: 10,
        historys: [] // 历史列表
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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },
    reportD: function() {

    },
    auditD: function() {
      
    }
})