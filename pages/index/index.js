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
        detaiShow: true,
        popShow: false,
        reportShow: false,
        fromCity: '',
        toCity: '',
        departureTime: '', // 计划出发时间
        arriverTime: '', // 计划到达时间
        statusName: '', // 状态名称
        cargoCode: '', // 车型代码
        sites: [],
        detail: {}
    },
    onLoad(options) {
        this.getWaybil();
    },
    getWaybil() {
        let page = this;
        request.getRequest(api.currentWaybil).then(res => {
            if (res.result) {
                if (res.data) {
                    // 有当前任务
                    let tasks = res.data.taskDetails;
                    let len = tasks.length;
                    let fromCity = tasks[0].cityName;
                    let toCity = tasks[len - 1].cityName;
                    let departureTime = res.data.planDepartureTime.slice(5, 16);
                    let arriverTime = res.data.planArriveTime.slice(5, 16);
                    let statusName = page.getStatusName(res.data.status);
                    let cargoCode = page.getCargos(res.data.cargoDetails);
                    let sites = res.data.taskDetails;
                    sites.forEach((site, i) => {
                        site.shortTime = site.scheduleTime.slice(5, 16);
                    });
                    page.setData({
                        detaiShow: true,
                        detail: res.data,
                        fromCity: fromCity,
                        toCity: toCity,
                        departureTime: departureTime,
                        arriverTime: arriverTime,
                        statusName: statusName,
                        cargoCode: cargoCode,
                        sites: sites
                    });
                } else {
                    // 无任务
                    page.setData({
                        detaiShow: false
                    });
                }
            } else {
                wx.showModal({
                    confirmColor: '#666',
                    content: res.message,
                    showCancel: false,
                });
            }
        })
    },
    getStatusName(status) {
        let name = '';
        switch (status) {
            case 0:
                name = '待下发';
                break;
            case 1:
                name = '待接受';
                break;
            case 2:
                name = '待发车';
                break;
            case 3:
                name = '运输中';
                break;
            case 4:
                name = '已送达';
                break;
            case 5:
                name = '已确认送达';
                break;
        }
        return name;
    },
    // 获取车型代码
    getCargos(cargos) {
        let str = '';
        let len = cargos.length;
        if (len > 0) {
            cargos.forEach((item, i) => {
                str += i === len - 1 ? `${item.modelCode}(${item.amount})` : `${item.modelCode}(${item.amount});`;
            });
        }
        return str;
    },
    // 接受任务
    acceptTask(e) {
        let page = this;
        let id = e.currentTarget.dataset.id;
        console.log('id', id);
        request.postRequest(utils.apiFormat(api.acceptTask, {id: id})).then(res => {
            if (res.result) {
                // 接受任务成功
                console.log(res.data);
                page.setData({
                    reportShow: true
                })
            } else {
                // 接受任务失败
                page.setData({
                    reportShow: false
                });
                wx.showModal({
                    confirmColor: '#666',
                    content: res.message,
                    showCancel: false,
                });
            }
        })
    },
    reportSite(e) {
        let page = this;
        let id = e.currentTarget.dataset.id;
        const params = {
            "dealers": [
                "string"
            ],
            "latitude": 0,
            "longitude": 0,
            "siteOrder": 0
        };
        request.postRequest(utils.apiFormat(api.reportSite, { id: id }), {
            data: params,
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
        .then(res => {
            if (res.result) {
                // 上报站点成功
                console.log(res.data);
                // page.setData({
                //     reportShow: true
                // })
            } else {
                // 上报站点失败
                wx.showModal({
                    confirmColor: '#666',
                    content: res.message,
                    showCancel: false,
                });
            }
        })
    }
})