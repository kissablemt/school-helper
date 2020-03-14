// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var post_id = event.post_id
  var table = "Message"
  var open_id = event.open_id
  var data, i
  // 获取我的收藏列表
  await db.collection(table).where({
    open_id: open_id
  }).get().then(res => {
    
    data = res.data[0]
    console.log(data)
    let len = data.my_collection.length
    // 若这个帖子已经收藏，则说明是取消收藏
    // 若帖子还未收藏，则进行收藏
    for (i = 0; i < len; ++i) {
      if (data.my_collection[i] == post_id) {
        data.my_collection.splice(i,1)
        break;
      }
    }
    if (i == len)
      data.my_collection.push(post_id)
  })
  // 更新我的收藏列表
  await db.collection(table).where({
    open_id: open_id
  }).update({
    data: {
      my_collection: data.my_collection
    }
  }).then(res => {
    console.log(res)
  })
  return data
}