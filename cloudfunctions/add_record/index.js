// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const _ = db.command
  var ID = "ID"
  var database_id = "database_id"
  var id, i

  var table = event.table           // 表的名称
  var name_id = event.name_id       // 表的主键
  var image_num = event.image_num   // 上传的图片的个数
  var mydata = event.mydata         // 表的字段及对应内容

  console.log(image_num)
  // 若有图片
  if (image_num != undefined) {
    await db.collection('ID').doc('database_id').update({
      // data 传入需要局部更新的数据
      data: {
        image_id: _.inc(image_num)
      }
    }).then(console.log).catch(console.error)
  }

  await db.collection(ID).doc(database_id).get()
    .then(res => {
      id = res.data[name_id]
      mydata[name_id] = id+1
      console.log(mydata)
      return db.collection(table).add({
        data: mydata
      }).then(res => {
        console.log(res)
        return db.collection(ID).doc(database_id).update({
          data: {
            [name_id]: _.inc(1)
          }
        }).then(res=>{
          console.log(res)
        })
      })
    })
  return mydata
}
