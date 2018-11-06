// pages/dispatchDetail/dispatchDetail.js
// export const updateFun = (opt, payload) => fetch.post(apiFormat(updateApi, opt), payload);
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import moment from '../../utils/moment.js'
import WxValidate from '../../plugins/wx-validate/WxValidate';
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';

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
    detail: {},
    wayNum: null,
    showLeft: false,
    windowHeight: null,
    driverInfo: {},
    upUrl: null,
    authSetting: false,
    reportImg: '../image/addReport.png',
    eventImg: '../image/bill_report.png',
    personImg: '../image/person2.png'
  },
  onLoad(options) {
    this.getWaybil();
    this._getDriver();
    const res = wx.getSystemInfoSync();
    this.setData({
      windowHeight: res.windowHeight + 'px',
      upUrl: app.upUrl
    })
    wx.getSetting({
      success:(res)=> {
        if (!res.authSetting['scope.userLocation']) {
          this.setData({
            authSetting: false
          })
        } else {
          this.setData({
            authSetting: true
          })
        }
      }
    })
    this._upData();
  },
  onShow() {
    this.updataLogin()
  },
  getWaybil() {
    wx.showLoading({
      title: '加载数据中...',
      mask: true
    })
    setTimeout(()=> {
      wx.hideLoading()
    },5000)
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
            sites: sites,
            wayNum: res.data.waybillNum
          });
        } else {
          // 无任务
          page.setData({
            detaiShow: false
          });
        }
        setTimeout(()=> {
          wx.hideLoading()
        },300)
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
    console.log(cargos)
    let str = [];
    if (cargos.length > 0) {
      cargos.forEach((item, i) => {
        str === str.push(i === cargos.length-1 ? item.modelCode + '('+item.amount+')' : item.modelCode+'('+item.amount+'),');
      });
    }
    return str;
  },
  // 接受任务
  acceptTask(e) {
    wx.showLoading({
      title: '更新状态中...',
      mask: true
    })
    setTimeout(()=> {
      wx.hideLoading()
    },7000)
    let page = this;
    let id = e.currentTarget.dataset.id;
    console.log('id', id);
    request.postRequest(utils.apiFormat(api.acceptTask, { id: id })).then(res => {
      if (res.result) {
        // 接受任务成功
        console.log(res.data);
        setTimeout(()=> {
          page.getWaybil();
          page.setData({
            reportShow: true
          })
        }, 1000)
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
        // 有经销商
        let preSite = page.data.sites[index - 1];
        let preSiteIsDisabled = page.isDisabledBtn(preSite);
        if (preSiteIsDisabled) {
          page.setData({
              popShow: true
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
      wx.showLoading({
        title: '上报站点中...',
        mask: true
      })
      wx.getLocation({
        type: 'gcj02',
        altitude: true,
        success: function (res) {
          console.log(res)
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
            data: params,
            header: {
              'content-type': 'application/json'
            }
          })
            .then(res => {
              if (res.result) {
                // 上报站点成功
                console.log('reportSite', res.data);
                page.setData({
                  popShow: false
                });
                
                setTimeout(function(){
                  page.getWaybil();
                  // wx.hideLoading()
                  wx.showToast({
                    title: '上报站点成功',
                    icon: 'success',
                    mask: true
                  });
                },300)
              } else {
                // 上报站点失败
                wx.hideLoading()
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
      console.log('preSiteIsDisabled', preSiteIsDisabled);
      if (preSiteIsDisabled) {
        console.log(1)
        // 上个站点已报站完成
        wx.showLoading({
          title: '上报站点中...',
          mask: true
        })
        wx.getLocation({
          type: 'gcj02',
          altitude: true,
          success: (res)=> {
            console.log(res)
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
              if (selectedDealers.length === 0) {
                // 没有选择经销商
                wx.showToast({
                  title: '请至少选择一个经销商',
                  icon: 'none'
                })
                return;
              }
              params = {
                "dealers": selectedDealers,
                "latitude": latitude,
                "longitude": longitude,
                "siteOrder": index
              };
            }
            request.postRequest(utils.apiFormat(api.reportSite, { id: id }), {
              data: params,
              header: {
                'content-type': 'application/json'
              }
            })
              .then(res => {
                if (res.result) {
                  // 上报站点成功
                  console.log('reportSite', res.data);
                  page.setData({
                    popShow: false
                  });
                  
                  setTimeout(function(){
                    page.getWaybil();
                    // wx.hideLoading()
                    wx.showToast({
                      title: '上报站点成功',
                      icon: 'success',
                      mask: true
                    });
                  },300)
                } else {
                  // 上报站点失败
                  wx.hideLoading()
                  wx.showModal({
                    confirmColor: '#666',
                    content: res.message,
                    showCancel: false,
                  });
                }
              })
          },
          fail: function (res) {
            wx.hideLoading()
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
    } else {
      return false;
    }
  },
  // 授权的按钮
  Handler(e) {
    this.setData({
      authSetting: e.detail.authSetting['scope.userLocation']
    })
  },
  // 下拉刷新
  async onPullDownRefresh(e) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    await this.getWaybil();
    setTimeout(()=> {
      wx.stopPullDownRefresh();
      wx.hideLoading();
    },500)
  },
  // 获取司机的信息
  async _getDriver() {
    const res = await request.getRequest(api.driverInfo);
    this.setData({
      driverInfo: res.data
    })
  },
  // 更新登录的时间
  async updataLogin() {
    await request.postRequest(api.updataLogin)
  },
  // 跳转到个人信息的页面
  toInfo() {
    wx.navigateTo({
      url: '../userInfo/userInfo'
    })
  },
  // 抽屉
  toggleLeft1(e) {
    console.log(e)
    this.setData({
      showLeft: !this.data.showLeft
    });
  },
  // 抽屉菜单的页面跳转
  oldHistory() {
    wx.navigateTo({
      url: '../history/history',
    })
  },
  myTask() {
    wx.navigateTo({
      url: '../messages/messages',
    })
  },
  myLoan() {
    wx.navigateTo({
      url: '../reimbursements/reimbursements',
    })
  },
  myLeave() {
    wx.navigateTo({
      url: '../myLeave/myLeave',
    })
  },
  aplplyLoan() {
    wx.navigateTo({
      url: '../aplplyLoan/aplplyLoan',
    })
  },
  changePass() {
    wx.navigateTo({
      url: '../changePass/changePass',
    })
  },
  bindweixin() {
    wx.navigateTo({
      url: '../bindWe/bindWe',
    })
  },
  // 点击单据上报或事件上报更改图片
  eTouchstart (e) {
    console.log(e)
    this.setData({
      eventImg: '../image/bill_report2.png'
    })
  },
  eTouchend () {
    setTimeout(()=> {
      this.setData({
        eventImg: '../image/bill_report.png'
      })
    },300)
  },
  rTouchstart (e) {
    console.log(e)
    this.setData({
      reportImg: '../image/addReport2.png'
    })
  },
  rTouchend () {
    setTimeout(()=> {
      this.setData({
        reportImg: '../image/addReport.png'
      })
    }, 300)
  },
  pTouchstart (e) {
    console.log(e)
    this.setData({
      personImg: '../image/person3.png'
    })
  },
  pTouchend () {
    setTimeout(()=> {
      this.setData({
        personImg: '../image/person2.png'
      })
    }, 200)
  },
  // 判断是否要更新小程序
  _upData() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        console.log(res)
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了',
              content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，请升级到最新微信版本。'
      })
    }
  }
})