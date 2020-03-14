// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var table = "Message"
  var to_open_id = event.to_open_id
  var data
  console.log(to_open_id)
  await db.collection(table).where({
    open_id: to_open_id
  }).get().then(res => {
    console.log(res)
    
    data = res.data[0]
    let mess = event.mess
    data.my_mess.push(mess)
  })

  await db.collection(table).where({
    open_id: to_open_id
  }).update({
    data: {
      my_mess: data.my_mess
    }
  }).then(res => {
    console.log(res)
  })
  return data
}