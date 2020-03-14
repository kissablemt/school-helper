// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const _ = db.command
  //var name_id = "post_id" // 要删除的记录的表的主键名称
  var table = "Post"     // 要删除的记录的表
  var id = event.id           // 要删除的记录的id
  var i, j, image, fileIDs
  var postfix = '.jpg', path = 'cloud://envir-i8vdp.656e-envir-i8vdp/image/'

  console.log(table)
  console.log(id)
  
  for (i=0; i<id.length; ++i) {
    await db.collection(table).where({
      post_id : parseInt(id[i])
    }).get().then(res => {
      console.log(res)
      image = res.data[0].image
      console.log(image)
      if (image != null && image.length != 0) {
        fileIDs = []
        for (j = 0; j < image.length; ++j) {
          console.log(image[j])
          fileIDs.push(path + image[j] + postfix)
        }
        console.log(fileIDs)
        cloud.deleteFile({ fileList: fileIDs })
          .then(res => {
            console.log("rm image:", res)
          })
      }
    })
    await db.collection(table).where({
      post_id: parseInt(id[i])
    }).remove().then(res => {
      console.log("rm post_id:", res)
    })
    await db.collection('Comment').where({
      post_id: parseInt(id[i])
    }).remove().then(res=>{
      console.log("rm comment:", res)
    })
  }
}