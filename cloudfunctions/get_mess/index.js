// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  var table = "Comment"
  var name_id = "reply_id"
  var open_id = event.open_id
  var my_mess = []
  var result = []
  var user_comment_total = 0 //该用户被评论的总数
  var oneTime_getComment = 100 //一次获取该用户，100条
  var chi = 0; //共需获取的次数

  await db.collection("Message").where({
    open_id: open_id
  }).get().then(res => {
    my_mess = res.data[0].my_mess //拿到comment 的 reply_id
  })
  console.log("my_mess", my_mess)

  if (my_mess.length > 0) { //当有被回复过

    await db.collection(table).where({
      to_open_id: open_id
    }).count().then(res => {
      user_comment_total = res.total
      chi = Math.ceil(user_comment_total / oneTime_getComment) /*向上取整 */
      console.log("chi",chi)
      console.log(user_comment_total ,":",oneTime_getComment)
    })

    for (let i = 0; i < chi; i++) { 
      if (i == 0) {
        await db.collection(table).where({ //获取 to_open_id ，即使用者 被留言的commentData
          to_open_id: open_id
        }).get().then(res => {
          var data = res.data
          console.log('data' + i, res.data)
          for (let i = 0; i < data.length; ++i) { //筛选数据
            for (let j = 0; j < my_mess.length; ++j) {
              if (data[i][name_id] == my_mess[j][0])
                result.push(data[i]);
            }
          }
        })
      } else {
        await db.collection(table).skip(oneTime_getComment * i).where({
          to_open_id: open_id
        }).get().then(res => {
          var data = res.data
          console.log('data' + i, res.data) 
          for (let i = 0; i < data.length; ++i) {
            for (let j = 0; j < my_mess.length; ++j) {
              if (data[i][name_id] == my_mess[j][0])
                result.push(data[i]);
            }
          }
        })
      }
      if(my_mess.length == result.length){
        console.log("my_mess取完")
        break
      }
    }
  }

  console.log(result)
  return {
    result,
    my_mess
  }

}