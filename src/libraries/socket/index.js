const httpEvent = require('../../interfaces/Http')
const socketEvent = require('../../interfaces/Socket')
const danmuEvent = require('../../interfaces/Danmu')
const log = require('../../utilities/log')
const config = require('../../../config')
let inProcessRandomNumber = Math.random()
let io = null
module.exports = {
  init: function (callback) {
    // 删除弹幕
    danmuEvent.removing.listen(data => {
      Object.keys(data).forEach(room => {
        io.to(room).emit('delete', data[room])
      })
    })
    // 推送弹幕
    danmuEvent.transfer.listen(data => {
      io.to(data.room).emit('danmu', data)
    })

    // 当服务器创建后，绑定WebSocket
    httpEvent.created.listen(app => {
      io = require('socket.io')(app)

      io.on('connection', socket => {
        // 向客户端推送密码请求
        socket.emit('init', 'Require Password.')
        socket.on('password', data => {
          let room = data.room
          if (!config.rooms[room]) {
            socket.emit('init', 'Room Not Found')
            log.log(`${socket.id}试图加入未定义房间`)
            return false
          }
          if (data.password !== config.rooms[room].connectpassword) {
            socket.emit('init', 'Password error')
            return false
          }
          if (!data.info) {
            log.log('该版本弹幕客户端过老，请更新弹幕客户端。')
            return false
          }
          log.log(`客户端 ${socket.id}（${data.info.version}） in ${socket.conn.remoteAddress} 连接于 ${room}`)
          socket.join(room)
          socket.emit('connected', {
            version, // eslint-disable-line
            randomNumber: inProcessRandomNumber // 用于给客户端检测服务器是重启还是断线
          })
        })
      })
      socketEvent.created.emit(io)
    })

    callback(null)
  }
}
