// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var table = "Message"
  var open_id = event.open_id       // 用户的open_id
  var del_field = "my_mess"         // 删除的字段
  var del_list = event.del_list     // 删除的列表
  var data, update_list = []        // 更新的列表

  // 获取我的消息列表
  await db.collection(table).where({
    open_id: open_id
  }).get().then(res => {
    let i, j, flag = true
    data = res.data[0]
    console.log(data)
    // 取得更新列表
    let len = data[del_field].length
    for (i = 0; i < len; ++i) {
      flag = true
      for (j = 0; j < del_list.length; ++j) {
        // 若该条信息是需要删除的就跳过，
        // 否则添加到跟新列表中
        console.log("data:", data[del_field][i][0], "del_list:", del_list[j])
        if (data[del_field][i][0] == del_list[j]) {
          flag = false
          del_list.splice(j, 1)
          break;
        }
      }
      if (flag)
        update_list.push(data[del_field][i])
    }
    console.log(update_list)
    console.log(del_list)
  })

  // 更新我的消息列表
  await db.collection(table).where({
    open_id: open_id
  }).update({
    data: {
      [del_field]: update_list
    }
  }).then(res => {
    console.log("update:",res)
  })
  
  return update_list
}