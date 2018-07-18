module.exports = {
  login: '/api/pub/app/login', //租户登录 method 'post'
  currentWaybil: '/api/driver/waybill/current', //租户登录 method 'post'
  acceptTask: '/api/driver/waybill/{id}/accept', // 司机接受任务
  reportSite: '/api/driver/waybill/{id}/siteEvent' // 司机上报任务站点
}