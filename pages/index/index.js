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
        sites: [], // 站点列表
        dealers: [], // 经销商列表
        selectedDealers: [], // 选中的经销商
        reportId: null, // 报站站点id
        reportIndex: null, // 报站站点索引
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
                    let reportShow = res.data.status === 1 ? false : true;
                    let cargoCode = page.getCargos(res.data.cargoDetails);
                    let sites = res.data.taskDetails;
                    sites.forEach((site, i) => {
                        site.shortTime = site.scheduleTime.slice(5, 16);
                    });
                    page.setData({
                        detaiShow: res.data.status === 5 ? false : true,
                        // detaiShow: true,
                        reportShow: reportShow,
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
    // 点击发车 交车按钮回调
    reportSite(e) {
        let page = this;
        let id = e.currentTarget.dataset.id;
        let index = e.currentTarget.dataset.index;
        let item = e.currentTarget.dataset.item;
        let dealers = [];
        item.deliverDetails.forEach(dealer => {
            dealer.isSelected = false;
            dealers.push(dealer);
        });
        console.log('dealers', dealers);
        // 判断是否为失效按钮
        let isDisabled = page.isDisabledBtn(item);
        console.log('isDisabled', isDisabled);
        if (isDisabled) {
            // 按钮失效 直接返回
            return;
        } else {
            // 按钮有效
            page.setData({
                dealers: dealers,
                reportId: id,
                reportIndex: index
            })
            if (dealers.length === 0) {
                // 没有经销商
                page.toReport();
            } else {
                page.setData({
                    popShow: true
                })
            }
        }
        
        
    },
    // 调报站接口
    toReport() {
        let page = this;
        let dealers = page.data.dealers;
        let id = page.data.reportId;
        let index = page.data.reportIndex;
        if (index === 0) {
            // 出发站点
            wx.getLocation({
                type: 'gcj02',
                success: function (res) {
                    // 获取经纬度
                    let latitude = res.latitude
                    let longitude = res.longitude
                    let params;
                    if (dealers.length === 0) {
                        // 无经销商
                        params = {
                            "dealers": [],
                            "latitude": latitude,
                            "longitude": longitude,
                            "siteOrder": index
                        };
                    } else {
                        // 有经销商
                        let selectedDealers = [];
                        dealers.forEach(deliver => {
                            if (deliver.isSelected) {
                                selectedDealers.push(deliver.dealer);
                            }
                        })
                        params = {
                            "dealers": selectedDealers,
                            "latitude": latitude,
                            "longitude": longitude,
                            "siteOrder": index
                        };
                    }
                    request.postRequest(utils.apiFormat(api.reportSite, { id: id }), {
                        data: params
                    })
                        .then(res => {
                            if (res.result) {
                                // 上报站点成功
                                console.log('reportSite', res.data);
                                page.setData({
                                    popShow: false
                                });
                                page.getWaybil();
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
                },
                fail: function (res) {
                    wx.showModal({
                        confirmColor: '#666',
                        content: '获取定位失败',
                        showCancel: false,
                    });
                }
            })
        } else {
            let preSite = page.data.sites[index - 1];
            let preSiteIsDisabled = page.isDisabledBtn(preSite);
            if (preSiteIsDisabled) {
                // 上个站点已报站完成
                wx.getLocation({
                    type: 'gcj02',
                    success: function (res) {
                        // 获取经纬度
                        let latitude = res.latitude
                        let longitude = res.longitude
                        let params;
                        if (dealers.length === 0) {
                            // 无经销商
                            params = {
                                "dealers": [],
                                "latitude": latitude,
                                "longitude": longitude,
                                "siteOrder": index
                            };
                        } else {
                            // 有经销商
                            let selectedDealers = [];
                            dealers.forEach(deliver => {
                                if (deliver.isSelected) {
                                    selectedDealers.push(deliver.dealer);
                                }
                            })
                            params = {
                                "dealers": selectedDealers,
                                "latitude": latitude,
                                "longitude": longitude,
                                "siteOrder": index
                            };
                        }
                        request.postRequest(utils.apiFormat(api.reportSite, { id: id }), {
                            data: params
                        })
                        .then(res => {
                            if (res.result) {
                                // 上报站点成功
                                console.log('reportSite', res.data);
                                page.setData({
                                    popShow: false
                                });
                                page.getWaybil();
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
                    },
                    fail: function (res) {
                        wx.showModal({
                            confirmColor: '#666',
                            content: '获取定位失败',
                            showCancel: false,
                        });
                    }
                })
            } else {
                // 上个站点还未报站完成
                let msg = '';
                if (index === 1) {
                    msg = '请先发车';
                } else {
                    msg = '上个站点还未上报完成，无法上报';
                }
                wx.showToast({
                    title: msg,
                    icon: 'none'
                })
            }
        }
            
    },
    changeDealers(e) {
        let page = this;
        let index = e.currentTarget.dataset.index;
        let delivered = e.currentTarget.dataset.delivered;
        if (delivered) {
            // 已运输经销商
            return;
        } else {
            let dealers = page.data.dealers;
            dealers[index].isSelected = !dealers[index].isSelected;
            page.setData({
                dealers: dealers
            });
        }
    },
    closePop(e) {
        let page = this;
        page.setData({
            popShow: false
        });
    },
    // 按钮是否失效
    isDisabledBtn(item) {
        console.log('isDisabledBtn', item)
        let arriveTime = item.arriveTime;
        let dealers = item.deliverDetails;
        if (arriveTime) {
            if (dealers.length === 0) {
                // 无经销商
                return true;
            } else {
                // 有经销商
                let result = true;
                dealers.forEach(dealer => {
                    if (dealer.delivered === false) {
                        result = false;
                    }
                });
                return result;
            }
        } else{
            return false;
        }
    }
})