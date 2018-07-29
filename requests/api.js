module.exports = {
  login: '/api/pub/app/login', //租户登录 method 'post'
  currentWaybil: '/api/driver/waybill/current', //租户登录 method 'post'
  acceptTask: '/api/driver/waybill/{id}/accept', // 司机接受任务
  reportSite: '/api/driver/waybill/{id}/siteEvent', // 司机上报任务站点
  history: '/api/driver/waybill', // 获取司机历史调度单列表 'get'
  historyCount: '/api/driver/waybill/count', // 获取司机历史调度单列表 'get'
  cancelReport: '/api/driver/orderreport/cancel', // 取消单据上报 'post'
  reportList: '/api/driver/orderreport/list', // 查询单据上报list 'get'
  reportCount: '/api/driver/orderreport/list/count', // 查询单据上报count 'get'
  dictApi: '/api/pub/dict'// 获取字典表
}