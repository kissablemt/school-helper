// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  
  var id_name = event.id_name
  var id_value = event.id_value
  console.log("id_name ", id_name)
  console.log("id_value ", id_value)
  console.log("table ", event.table)
  console.log(event.mydata)
   if (id_name == "_id") {
      return await db.collection(event.table).where({
        _id: id_value
      }).update({
        data: event.mydata
      }).then(res => {
        console.log(res)
      })
  }else  if(id_name == "post_id"){
      return await db.collection(event.table).where({
        post_id: id_value
      }).update({
        data: event.mydata
      }).then(res => {
        console.log(res)
      })
   } else if (id_name == "comment_id"){
      return await db.collection(event.table).where({
        comment_id: id_value
      }).update({
        data: event.mydata
      }).then(res => {
        console.log(res)
      })
   } else if (id_name == "reply_id"){
      return await db.collection(event.table).where({
        reply_id: id_value
      }).update({
        data: event.mydata
      }).then(res => {
        console.log(res)
      })
   } else if (id_name == "open_id"){
     return await db.collection(event.table).where({
       open_id: id_value
     }).update({
       data: event.mydata
     }).then(res => {
       console.log(res)
     })
   }
  else{
     return await db.collection(event.table).where({
       school_id: id_value
     }).update({
       data: event.mydata
     }).then(res => {
       console.log(res)
     })
  }
  /*
  return await db.collection(event.table).where({
    _id: id_value
  }).update({
    data: event.mydata
  }).then(res => {
    console.log(res)
  })
  */
/*
  return await db.collection(event.table).where({
    _id: "499de6e9-1104-457a-9f6a-e5e36f5f7756"
  }).update({
    data: event.mydata
  }).then(res => {
    console.log(res)
  })
  */
/*
  return await db.collection(event.table).where({
    _id:"499de6e9-1104-457a-9f6a-e5e36f5f7756"
  }).update({
    //event.mydata
    data: {
      content:"了看到进来士大夫"
    }
  }).then(res => {
    console.log(res)
  })
  */
}
