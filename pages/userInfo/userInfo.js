
import api from '../../requests/api.js'
import regeneratorRuntime from '../../utils/regenerator-runtime/runtime.js';
const app = getApp()
const request = app.WxRequest;// pages/userInfo/userInfo.js
Page({
  data: {
    driverInfo: {},
    profilePic: null,
    phone: null
  },
  onLoad: function (options) {
    this._getDriver();
  },
  // 获取司机的信息
  async _getDriver() {
    const res = await request.getRequest(api.driverInfo);
    console.log(res);
    this.setData({
      driverInfo: res.data,
      profilePic: res.data.profilePic,
      phone: res.data.phone
    })
  },
  // 换头像
  changepic() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册中选择'],
      itemColor: "#666",
      success: (res) => {
        console.log(res)
        if (res.tapIndex == 0) {
          this.chooseWxImage('camera')
        } else if (res.tapIndex == 1) {
          this.chooseWxImage('album')
        }
      }
    })
  },
  // 选择照片
  chooseWxImage(type) {
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: (res) => {
        wx.showToast({
          icon: "loading",
          title: "正在上传",
          duration: 1000
        });
        const path = res.tempFilePaths[0];
        console.log(path)
        wx.uploadFile({
          url: 'https://boyu.cmal.com.cn/api/pub/upload?app=true',
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
            const profilePic = JSON.parse(res.data).data.id
            this.driverTx(profilePic);
          },
          fail: function (e) {
            wx.showModal({
              title: '提示',
              content: '上传失败',
              showCancel: false
            })
          },
          complete: function () {
            wx.hideToast();  //隐藏Toast
          }
        })
      }
    })
  },
  // 修改司机头像
  async driverTx(profilePic) {
    const res = await request.postRequest(api.updatadriver+'?profilePic='+profilePic)
    if (res.result) {
      await this._getDriver();
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 2];  //上一个页面
      await prevPage._getDriver();
      wx.showToast({
        title: '修改头像成功',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '修改头像失败',
        icon: 'none'
      })
    }
  },
  // 修改手机号
  changephone () {
    wx.navigateTo({
      url: '../changePhone/changePhone?phone='+this.data.phone
    })
  },
  // 退出登录
  outlogin() {
    wx.showModal({
      title: '退出登录',
      confirmColor: '#666',
      content: '确认退出登录？',
      success: async (e) => {
        if (e.confirm) {
          const res = await request.postRequest(api.outlogin)
          if (res.result){
            wx.redirectTo({
              url: '../login/login'
            })
          } else {
            wx.showToast({
              icon: 'none',
              title: '退出登录失败'
            })
          }
        } else if (e.cancel) {

        }
      }
    })
  }
})