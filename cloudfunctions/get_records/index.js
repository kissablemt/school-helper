// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  var table = event.table
  var key = event.key
  var value = event.value
  var data, item, flag, i, j
  var result = []
  
  if (key != undefined) {
    await db.collection(table).get()
      .then( res => {
        data = res.data
        // console.log("res:", res)
        // console.log("res.data:",res.data)
        console.log("res.data.length:",res.data.length)

        for (j = 0; j < data.length; ++j) {
          flag = 1
          item = data[j]

          for (i = 0; i < key.length; ++i) {
            if (item[key[i]] != value[i]) {
              flag = 0
              break;
            }
          }
          if (flag == 1)
            result.push(item)
        }
      })
  }else {
    await db.collection(table).get()
    .then( res => {
      result = res.data
    })
  }
  // console.log(result)
  
  return result
}