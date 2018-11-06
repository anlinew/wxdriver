// pages/uploadReport/uploadReport.js
import api from '../../requests/api.js'
import utils from '../../utils/util.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
import QQMapWX from '../../utils/qqmap-wx-jssdk1.0/qqmap-wx-jssdk.js';
import WxValidate from '../../plugins/wx-validate/WxValidate';
const app = getApp()
const request = app.WxRequest;
var qqmapsdk;
Page({
  data: {
    statusName: null,
    id: null,
    statusId: null,
    wayInfo: {},
    imgList: [],
    idList: [],
    description: null,
    longitude: null,
    latitude: null,
    address: null,
    imgids: null,
    wayNum: null
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      description: {
        required: true
      }
    }
    // 验证字段的提示信息，若不传则调用默认的信息
    const messages = {
      description: {
        required: '事件备注不能为空'
      }
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({
      key: 'UP3BZ-N2SK2-722U4-CPFC7-E5VEO-2XFD3' //这里自己的key秘钥进行填充
    });
    this.setData({
      statusName: options.statusName,
      statusId: options.id,
      wayNum: options.wayNum
    })
    console.log(this.data.wayNum,this.data.id)
    this._getWayInfo();
    this.initValidate();
  },
  onShow: function () {
    this._getlocation();
  },
  // 新增上报时获取调度信息
  async _getWayInfo() {
    let page = this;
    const res = await request.getRequest(api.history, { data: { waybillNum: this.data.wayNum}})
    console.log(res);
    if (res.result) {
      // 获取新增上报时调度信息
      const wayInfo = res.data[0] || {};
      page.setData({
        wayInfo: wayInfo,
        id: wayInfo.id,
      });
    } else {
      wx.showModal({
        confirmColor: '#666',
        content: res.message,
        showCancel: false,
      });
    }
  },
  // 点击提交上报单据
  async acceptTask(e) {
    // 校验字段
    
    if (!this.WxValidate.checkForm(e)) {
      console.log(this.WxValidate.errorList)
      const error = this.WxValidate.errorList[0]
      wx.showModal({
        confirmColor: '#666',
        content: error.msg,
        showCancel: false,
      })
      return false
    }
    wx.showLoading({
      title: '正在上报...',
      mask: true,
    })
    setTimeout(() => {
      wx.hideLoading()
    }, 5000)
    // 获取imgids
    const arr = [];
    this.data.idList.forEach(item=> {
      arr.unshift(item)
    })
    this.setData({
      imgids : arr.join(',')
    })
    if (arr.length === 0) {
      wx.showToast({
        icon: 'none',
        title: '请至少上传一张图片',
      })
      return;
    }
    const payload = {};
    // 上报的位置
    payload.createAddress = this.data.address;
    // 经纬度
    payload.createLoc = this.data.latitude + ',' + this.data.longitude;
    // 上报的描述
    payload.description = this.data.description;
    // 上报的图片
    payload.imgIds = this.data.imgids;
    // 上报的类型、中文
    payload.curStatus = this.data.statusId;
    payload.statusName = this.data.statusName;
    // 调度单id
    payload.waybillId = this.data.id;
    const res = await request.postRequest(api.addEvent,{
      data: payload,
      header: {
        'Content-Type': 'application/json'
      }
    })
    if (res.result) {
      // wx.hideLoading()
      let pages = getCurrentPages();//当前页面
      let prevPage = pages[pages.length-3];//上一页面
      
      setTimeout(()=> {
        prevPage.getReportList();
        wx.navigateBack({
          delta: 2,
          success: (res) => {
            console.log(res)
          }
        })
        wx.showToast({
          icon: 'success',
          title: '新增上报成功',
        })
      }, 1000)
    } else {
      wx.hideLoading()
      wx.showToast({
        title: res.message,
        icon: 'none'
      })
    }
  },
  inputD(e) {
    this.setData({
    description: e.detail.value
    })
  },
  // 上传照片
  uploadFy: function () {
    const imgs = [];
    var that = this;
    wx.chooseImage({
      count: 9,
      sizeType: ["original", "compressed"],
      sourceType: ["camera"],
      success: function (res) {
        var addImg = res.tempFilePaths;
        that.upLoadImg(addImg[0]);
      },
    })
  },
  upLoadImg: function (imgs) {
    this.upload(imgs)
  },
  //多张图片上传
  upload: function (path) {
    var that = this;
    wx.showLoading({
      title: "正在上传",
      mask: true
    }),
    wx.uploadFile({
      url: app.upUrl+'/api/pub/upload?app=true',
      filePath: path,
      name: 'file',
      header: { 
        "Content-Type": "multipart/form-data",
       },
      success: (res) => {
        if (res.statusCode != 200 || !(JSON.parse(res.data).result)) {
          wx.showModal({
            title: '提示',
            content: '上传失败',
            showCancel: false
          })
          return;
        }
        const imgList= this.data.imgList;
        const idList= this.data.idList;
        imgList.push(path);
        idList.push(JSON.parse(res.data).data.id);
        that.setData({
          imgList: imgList,
          idList: idList
        })
        wx.hideLoading();
        wx.showToast({
          title: '图片上传成功',
          icon: 'success'
        })
      },
      fail: function (e) {
        wx.hideLoading();
        wx.showModal({
          title: '提示',
          content: '上传失败',
          showCancel: false
        })
      },
      complete: function () {
      }
    })
  },
  //删除图片
  clearImg: function (e) {
    var index = e.currentTarget.dataset.index;
    var imgList = this.data.imgList;
    var idList = this.data.idList;
    imgList.splice(index, 1);
    idList.splice(index, 1);
    this.setData({
      imgList: imgList,
      idList: idList
    })
  },
  // 获取纬度和经度
  _getlocation() {
    wx.getLocation({
      tyep: 'gcj02',
      altitude: true,
      success:(e) => {
        const longitude = e.longitude;
        const latitude = e.latitude;
        this.setData({
          longitude: longitude,
          latitude: latitude
        })
         // 获取当下的中文地址
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: (res)=> {
            this.setData({
              address: res.result.address,
            })
          },
          fail: function (res) {
          },
          complete: function (res) {
          }
        });
      }
    }) 
  }
})