// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => { 
  var result = {}
  var table = "Comment"
  var post_id = event.post_id
  var i, j, data

  console.log(post_id)
  await db.collection(table).where({
    post_id: post_id    // 获取某帖子的全部评论及留言
  }).orderBy("date","asc").get().then(res => {
    console.log(res)
    data = res.data     // 获取排序后的全部评论及留言
    for (i=0; i<data.length; ++i) {
      // 若是评论则开辟一个队列对应评论的数组
      if (data[i].parent_id == null || parseInt(data[i].parent_id) == -1) {
        result[data[i].reply_id] = new Array()
        result[data[i].reply_id].push(data[i])
      }
      else // 否则是留言按照父节点的评论的id，入队
        result[data[i].parent_id].push(data[i])
    }
    //console.log(result)
  })
  //console.log(result)
  //console.log(result[2])
  //console.log(result[4])
  return result;
}