module.exports = {
  login: '/api/pub/app/login', //租户登录 method 'post'
  currentWaybil: '/api/driver/waybill/current', //租户登录 method 'post'
  acceptTask: '/api/driver/waybill/{id}/accept', // 司机接受任务
  reportSite: '/api/driver/waybill/{id}/siteEvent', // 司机上报任务站点
  history: '/api/driver/waybill', // 获取司机历史调度单列表 'get'
  historyCount: '/api/driver/waybill/count', // 获取司机历史调度单列表 'get'
  addReport: '/api/driver/orderreport', //新增单据上报
  cancelReport: '/api/driver/orderreport/cancel', // 取消单据上报 'post'
  reportList: '/api/driver/orderreport/list', // 查询单据上报list 'get'
  reportCount: '/api/driver/orderreport/list/count', // 查询单据上报count 'get'
  dictApi: '/api/pub/dict',// 获取字典表
  eventList: '/api/driver/eventreport/list',// 获取事件上报
  addEvent: '/api/driver/eventreport/add',// 新增事件上报
  cancelEvent: '/api/driver/eventreport/del',// 取消事件上报
  subAudit: '/api/driver/orderreport/submit', // 提交审批
  loanTotal: '/api/driver/waybillaccount/total', // 获取报销金额汇总详情
  loanList: '/api/driver/waybillaccount/list', // 获取报销列表
  oilList: '/api/driver/waybillaccount/gasdetail', // 燃油的接口(settlementDetailId)
  subsidy: '/api/driver/waybillaccount/subsidy', // 标准的接口
  applyList: '/api/driver/loan' // 查询借款信息
}