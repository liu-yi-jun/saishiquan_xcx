/**
 * 信息确认框
 * @param { String } tip
 * @param { String } title
 * @param { String } buttonText
 * @param { Function } callback
 * @param { Object, Boolean } cancelOptions
 */

// var Tip = function (tip, title = '提示', buttonText = '确定', callback = function () {}, cancelOptions = false) {
//   wx.showModal({
//     content: tip,
//     title: title,
//     confirmText: buttonText,
//     confirmColor: '#2cb569',
//     showCancel: !!cancelOptions ? true : false,
//     cancelText: !!cancelOptions['cancelText'] ?
//       cancelOptions['cancelText'] : '取消',
//     cancelColor: '#666',
//     success: function (res) {
//       console.log('用户点击', res)
//       callback(res)
//     }
//   })
// }

var Tip = function (tip, title = '提示', buttonText = '确定', cancelOptions = false) {
  return new Promise((resolve, reject) => {
    wx.showModal({
      content: tip,
      title: title,
      confirmText: buttonText,
      confirmColor: '#2cb569',
      showCancel: !!cancelOptions ? true : false,
      cancelText: !!cancelOptions['cancelText'] ?
        cancelOptions['cancelText'] : '取消',
      cancelColor: '#666',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })

}
/**
 * 信息展示框
 * @param { String } toastText
 * @param { number } duration
 * @param { Boolean,  String } icon
 * @param { Function } succCallback
 */
var Toast = function (toastText, duration = 1500, icon = false, succCallback = function () {}) {
  wx.showToast({
    icon: !!icon ? icon : 'none',
    title: toastText,
    duration: duration,
    mask: true,
    success: succCallback()
  })
}


/**
 *
 * @param { String } title
 * @param { Boolean } condition
 * @param { number } delay
 */
var showLoading = function (title = '加载中', condition = true, delay = 0) {
  // setTimeout(() => {
    if (!!condition) {
      wx.showLoading({
        title: title,
        mask: true,
      })
    }
  // }, delay)
}

/**
 * 预览图片
 * @param { Array } urls 需要预览的图片链接列表(不支持本地)
 * @param { String } current 当前显示图片的链接(不支持本地)
 */
var previewImage = function (urls = [], current) {
  wx.previewImage({
    urls: urls,
    current: current || urls[0],
  })
}

function chooseImage(count, compress, sourceType = ['album'], sizeType = ['compressed'], ) {
  // sourceType = ['album', 'camera']
  //  sizeType: ['original''compressed'],
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType,
      sourceType,
      success: result => {
        // resolve(result)
        compressManyImage(result.tempFilePaths, compress).then(res => resolve(res)).catch(err => reject(err))
      },
      fail: (err) => reject(err),
    })
  })
}

function compressManyImage(tempFilePaths, compress ={}) {
  console.log('compressManyImage')
  return new Promise((resolve, reject) => {
    let imgUrls = []
    let p = Promise.resolve()
    console.log('111111111')
    tempFilePaths.forEach((item, index) => {
      console.log(item)
      p = p.then(() => compressImage(item, compress)).then(res => {
        console.log('111111111',res)
        imgUrls.push(res.tempFilePath)
        if (tempFilePaths.length === index + 1) {
          resolve({
            tempFilePaths: imgUrls
          })
        }
        console.log(11)
        return
      }).catch(err => reject(err))
    });
  })
}

 function compressImage(tempFilePath,{isCompress = true,quality = 1,canvasid = 'canvas', max_width,max_height}) {
  return new Promise(async (resolve, reject) => {
  if (!isCompress) return resolve({tempFilePath})
  if (!max_width && !max_height) max_width = getSystemWH().windowWidth
  // 利用canvas压缩
  let { width,height } = await imageSize(tempFilePath, max_width,max_height)
      const ctx = wx.createCanvasContext(canvasid);
      console.log(ctx)
      ctx.drawImage(tempFilePath, 0, 0, width, height);
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: canvasid,
          x: 0,
          y: 0,
          fileType: 'jpg',
          width: width,
          height: height,
          quality,
          success: (res) =>  resolve(res),
          fail: err => reject(err) 
        });
    })
  })
}
function getSystemWH() {
  let  windowHeight= wx.getSystemInfoSync().windowHeight
  let windowWidth = wx.getSystemInfoSync().windowWidth
  console.log('windowHeight',windowHeight,'windowWidth',windowWidth)
  return {
    windowHeight,
    windowWidth
  }
}

function imageSize(tempFilePath,max_width,max_height) {
  return new Promise((resolve, reject)=> {
    wx.getImageInfo({
      src: tempFilePath
    }).then(res => {
      console.log(res)
      var width = res.width;
      var height = res.height;
      max_width = !isNaN(max_width) ? max_width : 0;
      max_height = !isNaN(max_height) ? max_height : 0;
      console.log(max_width,max_height)
      if (max_width == 0) {
        if (height > max_height) {
          width = Math.round(width *= max_height / height);
          height = max_height;
        }
      }
      if (max_height == 0) {
        if (width > max_width) {
          height = Math.round(height *= max_width / width);
          width = max_width;
        }
      }
      resolve({width,height})
    })
  })
}
function chooseVideo(sourceType = ['album']) {
  return new Promise((resolve, reject) => {
    wx.chooseVideo({
      sourceType,
      maxDuration: 60,
      camera: 'back',
      compressed: true,
      success: result => {
        resolve(result)
        // compressVideo(result.tempFilePath).then(res=>resolve(res)).catch(err=>reject(err))
      },
      fail: res => reject(res),
    })
  })
}

function vibrateShort() {
  return new Promise((resolve, reject) => {
    wx.vibrateShort({
      complete: () => resolve(),
      fail: () => reject()
    })
  })
}
// function compressImage(src, quality = 0) {
//   return new Promise((resolve, reject) => {
//     wx.compressImage({
//       src,
//       quality,
//       success: res => resolve(res),
//       fail: err => reject(err)
//     })
//   })
// }

// function compressManyImage(tempFilePaths,quality) {
//   return new Promise((resolve, reject) => {
//     let imgUrls = []
//     let p = Promise.resolve()
//     tempFilePaths.forEach((item, index) => {
//       p = p.then(() => compressImage(item, quality)).then(res => {
//         imgUrls.push(res.tempFilePath)
//         if (tempFilePaths.length === index + 1) {
//           resolve({tempFilePaths:imgUrls})
//         }
//         return
//       }).catch(err => reject(err))
//     });
//   })
// }



function compressVideo(src, quality = 'medium') {
  return new Promise((resolve, reject) => {
    wx.compressVideo({
      src,
      quality,
      bitrate: 0,
      fps: 0,
      resolution: 0,
      success: res => resolve(res),
      fail: err => reject(err)
    })
  })
}


module.exports = {
  Tip: Tip,
  Toast: Toast,
  showLoading: showLoading,
  previewImage: previewImage,
  chooseImage: chooseImage,
  chooseVideo: chooseVideo,
  vibrateShort: vibrateShort,
  compressImage: compressImage,
  compressManyImage: compressManyImage,
  compressVideo: compressVideo,

}