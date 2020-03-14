// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var cnt=0, sum
  var table = event.table
  var result, list = []
  //sum = 100
  await db.collection(table).count().then(res => {
    sum = res.total
  })
  console.log(sum)
  while(cnt < sum) {
    await db.collection(table).skip(cnt).get()
      .then(res => {
        list = list.concat(res.data)
      })
    cnt += 100
  }
  console.log(cnt)
  return list

}