var express = require('express'),
    app = express(),
    path = require('path'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    config = require('./config'),
    Promise = require('bluebird'),
    client = require('redis').createClient({
      'host': '172.17.0.1'
    });

app.use(express.static(path.join(__dirname)));

// set key definitions
var room_list = function () {
  return 'love-letter:room';
};
var player_token = function (token) {
  return 'love-letter:player:token:' + token;
};
var player_list = function () {
  return 'love-letter:player';
};
// score, games, is_online
var player_info = function (player) {
  return 'love-letter:player:' + player;
};
// is_ready, hand, status
var room_player_list = function (room) {
  return 'love-letter:room:' + room + ':player';
};
// busy or idle
var room_status = function (room) {
  return 'love-letter:room:' + room + ':status'
};
var room_deck = function (room) {
  return 'love-letter:room:' + room + ':deck'
};

const CARD_TYPE = {
  '侍卫': '说出一个非侍卫牌名称并选择一名玩家，若此玩家拥有此牌则被淘汰',
  '牧师': '查看另一名玩家的手牌',
  '男爵': '你和另一名玩家比较手牌点数，点数较小的玩家将被淘汰。',
  '侍女': '直到你的下一个回合，忽略其他玩家的卡牌对你的影响。',
  '王子': '选择一名玩家，此玩家弃一张手牌然后摸一张牌。',
  '国王': '选择另一名玩家，将你的手牌与之交换。',
  '女伯爵': '若你手牌中有国王牌或王子牌时，你必须打出女伯爵牌',
  '公主': '若你将公主牌打出或弃置，你将被淘汰。'
};

var result = function (result, message, data) {
  var r = RESULT_TEMPLATE;
  r.result = result == null ? 0 : result;
  r.message = message == null ? "success" : message;
  r.data = data;
  return r;
};

// test redis
client.on('error', function (err) {
  console.log('Redis error: ' + err);
});

app.get('/', function(req, res){
  res.send('<h1>Welcome to LoveLetter!</h1>');
});

// get room list
app.get('/rooms', function (req, res) {
  client.smembers(room_list(), function (err, replies) {
    res.send(result(0, "success", replies));
  })
});

/**
 * @deprecated
 * create or join in a room
 */
app.post('/rooms', function (req, res) {
  client.get(player_token(req.query['token']), function (err, player) {
    if (!player) {
      res.send(result(-1, "fail", null));
    }
  });
});

/**
 * get list of players
 */
app.get('/players', function (req, res) {
  client.smembers(player_list(), function (err, replies) {
    res.send(result(null, null, replies));
  })
});

/**
 * @const
 * @type {{score: number, games: number, is_online: boolean}}
 */
const INIT_PLAYER_INFO = {
  'score': 0,
  'games': 0,
  'is_online': true
};

const ROOM_STATUS = {
  IDLE: 1,
  BUSY: 2,
  COUNTDOWN: 3
};

const PLAYER_STATUS = {
  WATCHING: 1,
  PLAYING_NORMAL: 2,
  PLAYING_INVINCIBLE: 3,
  OUT: 4,
  NOT_READY: 5,
  READY: 6
};

const INIT_PLAYER_IN_ROOM = {
  'hand': [],
  'no': 0,
  'status': PLAYER_STATUS.WATCHING
};

const COUNT_DOWN_STARTER = 10;

var GAME_START_COUNT_DOWN_BREAK_FLAG = false;

var ALL_PLAYERS_READY_COUNT_DOWN_BREAK_FLAG = false;

function point_of_card(card) {
  return CARD_TYPE.indexOf(card);
}

/**
 * add a player
 * @return token
 */
app.post('/players', function (req, res) {
  var player = req.query['player_name']
  client.get(player, function (err, reply) {
    if (!reply) {
      var token = random_str(12);
      client.multi()
          .set(player_token(token), player)
          .sadd(player_list(), player)
          .hmset(player_info(player), INIT_PLAYER_INFO)
          .exec(function (err, reply) {
            if (!err) {
              res.send(result(null, null, token));
            } else {
              res.send(result(-1, "fail", null));
            }
      });
    }
  });
});

/**
 * test page
 * for browser client
 */
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, 'test.html'));
});

io.on('connection', function (socket) {

  // emit range
  // 1. room: players in room
  // 2. player: self
  var socket_room = function () {
    return "room:" + socket.room;
  };
  var socket_player = function () {
    return "player:" + socket.player;
  };

  // join the room to receive all the public message.
  socket.join(socket_room);

  // new player join in the room
  socket.on('join', function (token, room) {
    client.get(player_token(token), function (err, reply) {
      socket.player = reply;
      room_init(function () {
        // if room is idle, player sit down,
        // or player will just watch game.
        is_room_in_idle(function (r) {
          console.log('Player ' + socket.player + ' join in room ' + room);
          if (r) {
            player_sit_down_in_room();
            socket.join(socket_player);
            socket.to(socket_room).emit("join", socket.player);
          } else {
            player_watch_in_room();
          }
        });
      });
    });
  });

  function room_valid_seat_number(callback) {
    var no = 0;
    client.get(room_player_list(socket.room), function (err, replies) {
      replies.forEach(function (elem) {
        if (elem['no'] != 0) {
          no = no + 1;
        }
      });
      if (no < 4) {
        callback(no);
      } else {
        callback(false);
      }
    });
  }

  function player_sit_down_in_room(no) {
    var player = INIT_PLAYER_IN_ROOM;
    player['no'] = no;
    player['name'] = socket.player;
    player['status'] = PLAYER_STATUS.NOT_READY;
    client.sadd(room_player_list(socket.room), player);
    socket.to(socket_room()).emit("sit", socket.player, no);
  }
  
  function player_watch_in_room() {
    var player = INIT_PLAYER_IN_ROOM;
    player['name'] = socket.player;
    client.sadd(room_player_list(socket.room), player);
    socket.to(socket_room()).emit("watch", socket.player);
  }

  function get_player_with_name(name, callback) {
    client.get(room_player_list(), function (players) {
      players.forEach(function (player) {
        if (player['name'] == name) {
          callback(false, player);
        }
      });
      callback(true);
    });
  }

  // init room if not exists
  function room_init(callback) {
    client.get(room_status(socket.room), function (err, reply) {
      if (!reply) {
        client.multi()
            .set(room_status(socket.room), ROOM_STATUS.IDLE)
            .hmset(room_deck(socket.room), config.DECK_TEMPLATE)
            .sadd(room_player_list(socket.room), socket.player)
            .exce(function (err, result) {
              callback()
            });
      }
    });
  }

  function is_room_in_idle(callback) {
    client.get(room_status(socket.room), function (err, reply) {
      if (reply == ROOM_STATUS.IDLE) {
        callback(true)
      } else if (reply == ROOM_STATUS.COUNTDOWN) {
        game_start_count_down_break();
        callback(true);
      } else {
        callback(false);
      }
    });
  }

  // player leave room
  socket.on('disconnect', function() {
    console.log('Player ' + socket.player + ' disconnected');
    socket.to(socket_room).emit("notification", "disconnect", socket.player);
    // if room.state = busy and player is in the players_list,
    // then game should be ended.
    client.get(room_status(socket.room), function (err, reply) {
      if (!err) {
        get_player_with_name(socket.player, function (err, player) {
          if (!err) {
            if (is_player_is_playing(player)) {
              game_end()
            }
          }
        });
      }
    });
  });
  
  function is_player_is_playing(player) {
    return player['status'] == PLAYER_STATUS.PLAYING_NORMAL ||
        player['status'] == PLAYER_STATUS.PLAYING_INVINCIBLE ||
        player['status'] == PLAYER_STATUS.OUT
  }

  // player ready for game
  socket.on('ready', function() {
    console.log('Player ' + socket.player + ' disconnected');
    socket.to(socket_room).emit("notification", "ready", socket.player);
    // if all other players is ready,
    // only 1 player still not ready,
    // then give the player 10 seconds,
    // or make him ready by force.
    is_game_should_be_started(function (result, count) {
      if (result) {
        game_start_count_down_start();
      } else {
        if (count == 1) {

        }
      }
    })
  });

  function game_start_count_down_start() {
    game_start_count_down(10);
    socket.emit(socket_room(), "countdown");
  }

  // player draw card
  function player_draw_card(player) {
    // valid player is the right one and the card is such player's
    socket.to(socket_room).emit("player_draw", player, card);
    socket.to(player).emit("draw", card);
  }

  function game_start_count_down(count) {
    // if count is broken, then stop it.
    if (GAME_START_COUNT_DOWN_BREAK_FLAG) {
      clearTimeout(game_start_count_down(count));
      GAME_START_COUNT_DOWN_BREAK_FLAG = false;
      return;
    }
    // count == 0, game start
    if (count == 0) {
      game_start()
    } else {
      setTimeout(game_start_count_down(count-1), 1);
    }
  }

  function game_start_count_down_break() {
    GAME_START_COUNT_DOWN_BREAK_FLAG = true;
  }

  // player use card
  function player_use_card(player, card, target, extend) {
    socket.to(socket_room).emit("player_use", player, card, target, extend);
  }

  socket.on("player_use", function (player, card, target, extend) {
    // valid player is the right one and the card is such player's
    socket.to(socket_room).emit("player_draw", player, card, target);
  });

  // player fold card
  function player_fold_card(player, card) {
    socket.to(socket_room).emit("player_fold", socket.player, card);
  }

  // player out
  function player_out(player) {
    // discard card of hand.
    player_fold_card(player['name'], player['hand'][0])
    socket.to(socket_room).emit("player_out", player['name']);
  }

  function is_player_playing_and_normal() {

  }

  // card engine
  // 1. bodyguard
  function card_engine_bodyguard(player) {
    socket.to(socket_room).emit("card_engine_bodyguard", player);
    client.get(player_info(player), function (err, reply) {

    });
  }

  // 2. periest
  function card_engine_priest() {
    socket.to(socket_room).emit("card_engine_priest", socket.player, target);
    socket.to(player).emit("card_engine_priest", player, card);
  }

  // 3. baron
  function card_engine_baron() {
    socket.to(socket_room()).emit("card_engine_baron", socket.player, target);
    get_player_with_name(socket.player, function (err, player1) {
      if (!err) {
        get_player_with_name(socket.player, function (err, player2) {
          if (!err) {
            var player1_card = player1['hand'][0];
            var player2_card = player2['hand'][0];
            if (player1['hand'][0] == CARD_TYPE.男爵) {
              player1_card = player1['hand'][1];
            }
            if (point_of_card(player1_card) > point_of_card(player2_card)) {
              player_out(player2);
            }
          }
        })
      }
    })
  }

  // 4. handmaid
  function card_engine_handmaid() {
    socket.to(socket_room()).emit("card_engine_baron", socket.player);
    get_player_with_name(socket.player, function (err, player) {
      player['status'] = PLAYER_STATUS.PLAYING_INVINCIBLE;
      client.update(room_player_list(socket.room), player);
    });
  }

  // 5. prince
  function card_engine_prince() {
    socket.to(socket_room()).emit("card_engine_prince", socket.player, target);
    get_player_with_name(target, function (err, player) {
      var card_to_fold = player['hand'][0];
      if (target == socket.player && card_to_fold == CARD_TYPE.王子) {
        card_to_fold = player['hand'][1];
      }
      player_fold_card(target, card_to_fold);
      player_draw_card(target);
    });
  }

  // 6. king
  function card_engine_king() {
    socket.to(socket_room()).emit("card_engine_prince", socket.player, target);
    get_player_with_name(target, function (err, player_target) {
      get_player_with_name(socket.player, function (err, player) {
        var card_to_exchange = player['hand'][0];
        if (target == socket.player && card_to_fold == CARD_TYPE.国王) {
          card_to_exchange = player['hand'][1];
          // ToDo: not finished yet.
        }
        socket.to(socket_player())
      })
    })
  }

  // 8. princess
  function card_engine_princess() {
    socket.to(socket_room()).emit("card_engine_princess", socket.player);
    player_out(socket.player)
  }

  // game start
  function game_start() {
    socket.to(socket_room).emit("game_start");
    // init deck and player's hand
  }

  // game end
  function game_end() {
    socket.to(socket_room).emit("game_end");
    is_game_should_be_ended(function (result) {
      if (result) {
        // game is ended normally, close accounts.
        close_all_accounts();
      } else {
        // game is broken, nothing will happen.
      }
    })
  }

  function close_all_accounts(winner) {
    // 1. all players add 1 count.
    // 2. winner add 1 win.
    client.get(room_player_list(socket.room), function (err, players) {
      players.forEach(function (player) {
        if (is_player_is_playing(player['name'])) {
          if (player['name'] == winner) {
            player['score'] = player['score'] + 1;
          }
          player['games'] = player['games'] + 1;
          client.set(player_info(player['name']), player);
        }
      })
    });
  }

  function is_game_should_be_started(callback) {
    // player.count >= 2 and all players.is_ready = true
    client.get(room_player_list(socket.room), function (err, reply) {
      if (reply.count < 2) callback(false);
      else {
        
      }
    });
  }

  // next step
  function next() {
    is_game_should_be_ended(function (result) {
      if (result) {

      } else {
        is_should_step_forward(function (cb) {
          if (cb) {
            // next player draw card
          }
        })
      }
    });
  }

  function is_game_should_be_ended(callback) {
    // 1. all players hand.count = 1 and room.deck.count = 0
    // 2. only 1 player.status = alive
    client.get(room_player_list(socket.room), function (err, players) {
      is_all_players_hand_count_1(function (result) {
        if (result) {
          callback(true);
        }
      });
      var count = 0;
      players.forEach(function (item) {
        if (item['status'] == PLAYER_STATUS.PLAYING_NORMAL) {
          count = count + 1;
        }
      });
      if (count <= 1) {
        callback(true);
      }
    });
  }

  function is_should_step_forward(callback) {
    // everyone hand.count = 1
    is_all_players_hand_count_1(function (result) {
      callback(result);
    });
  }

  function is_all_players_hand_count_1(callback) {
    client.get(room_player_list(socket.room), function (err, replies) {
      replies.forEach(function (item) {
        if (item['hand'].count != 0) {
          callback(false);
        }
      });
      callback(true);
    });
  }

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

var random_str = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};