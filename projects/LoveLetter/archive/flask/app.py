# -*- coding: utf-8 -*-
import random
import string
import os
import config

from flask import *
app = Flask(__name__)

app.secret_key = os.urandom(32)

card_type = {
    "Guard": "说出一个非Guard牌名称并选择一名玩家，若此玩家拥有此牌则被淘汰",
    "Priest": "查看另一名玩家的手牌",
    "Baron": "你和另一名玩家比较手牌点数，点数较小的玩家将被淘汰。",
    "Handmaid": "直到你的下一个回合，忽略其他玩家的卡牌对你的影响。",
    "Prince": "选择一名玩家，此玩家弃一张手牌然后摸一张牌。",
    "King": "选择另一名玩家，将你的手牌与之交换。",
    "Countess": "若你手牌中有King牌或Prince牌时，你必须打出Countess牌",
    "Princess": "若你将Princess牌打出或弃置，你将被淘汰。"
}

card_num = {
    "Guard": 1,
    "Priest": 2,
    "Baron": 3,
    "Handmaid": 4,
    "Prince": 5,
    "King": 6,
    "Countess": 7,
    "Princess": 8
}

deck_template = ['Guard', 'Guard', 'Guard', 'Guard', 'Guard', 'Priest', 'Priest', 'Baron',
                 'Baron', 'Handmaid', 'Handmaid', 'Prince', 'Prince', 'King', 'Countess', 'Princess']

public_endpoint = ['home', 'join']

progress_endpoint = ['ready', 'draw', 'fold', 'use', 'show', 'result']

s = {}


@app.before_request
def before_request():
    if request.endpoint not in public_endpoint and request.args.get('player') == '':
        return "Not authorized!"
    if request.endpoint in progress_endpoint and request.args.get('room') == '':
        return "Room not exists!"
    if request.endpoint in progress_endpoint and not s.get('player_token:' + request.args.get('player')):
        return "Invalid token!"
    if not s.get('room'):
        s['room'] = []


def random_str(length=8):
    a = list(string.ascii_letters)
    random.shuffle(a)
    return ''.join(a[:length])


@app.route('/join/<room>/<player>', methods=['POST', 'GET'])
def join(room, player):
    player_token = random_str()
    if room not in s['room']:
        init_room(room)
    if player in s['room:' + room + ':player']:
        return "Duplicate player!"
    init_player(player_token, player)
    if not is_room_full(room):
        player_join_room(room, player)
    return player_token


def init_player(token, player):
    s['player_token:' + token] = player


def init_room(room):
    s['room'].append(room)
    s['room:' + room + ':player'] = []


def is_room_full(room):
    return len(s['room:' + room + ':player']) >= 4


def player_join_room(room, player):
    s['room:' + room + ':player'].append(player)
    s['room:' + room + ':player:' + player + ':status'] = False
    s['room:' + room + ':player:' + player + ':hand'] = []


@app.route('/readystatus', methods=['POST', 'GET'])
def readystatus():
    room = request.args.get('room')
    if is_game_ready_to_start(room):
        return "Game start"
    return jsonify([{"username": i, "ready": s['room:' + room + ':player:' + i + ':status']}
                    for i in s['room:' + room + ':player']])


@app.route('/ready', methods=['POST', 'GET'])
def ready():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    if s['room:' + room + ':player:' + player + ':status']:
        return "Already ready."
    s['room:' + room + ':player:' + player + ':status'] = True
    if is_game_ready_to_start(room):
        game_start(room)
    return jsonify([{"username": i, "ready": s['room:' + room + ':player:' + i + ':status']}
                    for i in s['room:' + room + ':player']])


@app.route('/all', methods=['POST', 'GET'])
def display_all():
    print(s)
    return "OK"


def is_game_ready_to_start(room):
    return len(s['room:' + room + ':player']) == 2 and is_all_player_ready(room)


def is_all_player_ready(room):
    for i in s['room:' + room + ':player']:
        if not s['room:' + room + ':player:' + i + ':status']:
            return False
    return True


def game_start(room):
    priority = len(s['room:' + room + ':player'])
    s['room:' + room + ':deck'] = deck_template
    s['room:' + room + ':fold_deck'] = []
    for i in s['room:' + room + ':player']:
        s['room:' + room + ':player:' + i + ':hand'] = []
        s['room:' + room + ':player:' + i + ':out'] = False  # initialize out status at beginning of game
        s['room:' + room + ':player:' + i + ':fold_deck'] = []
        s['room:' + room + ':player:' + i + ':turn'] = priority
        s['room:' + room + ':player:' + i + ':maid'] = False
        card = draw_one_card_from_deck(room)
        player_add_one_card(room, i, card)
        priority -= 1


def game_end(room):
    for i in s['room:' + room + ':player']:
        s['room:' + room + ':player:' + i + ':status'] = False


@app.route('/room/<room>', methods=['POST', 'GET'])
def show_room(room):
    print(s['room'])
    if room not in s['room']:
        return "Room not exists."
    return jsonify(s['room:' + room + ':player'])


# Only work for two players
@app.route('/draw', methods=['POST', 'GET'])
def draw():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    if not is_game_ready_to_start(room):
        return "Game not start yet."
    if s['room:' + room + ':player:' + player + ':turn'] == 1:
        s['room:' + room + ':player:' + player + ':turn'] = len(s['room:' + room + ':player'])
        for i in s['room:' + room + ':player']:
            if i == player:
                continue
            s['room:' + room + ':player:' + i + ':turn'] -= 1
    else:
        return "This is not your turn"
    card = draw_one_card_from_deck(room)
    player_add_one_card(room, player, card)
    s['null'] = ""
    return redirect(url_for('show', room=room, player=request.args.get('player')))


def draw_one_card_from_deck(room):
    if is_deck_empty(room):
        game_end(room)
    index = random.randint(0, len(s['room:' + room + ':deck']) - 1)
    return s['room:' + room + ':deck'].pop(index)


def player_add_one_card(room, player, card):
    s['room:' + room + ':player:' + player + ':hand'].append(card)
    if s['room:' + room + ':player:' + player + ':maid']:
        s['room:' + room + ':player:' + player + ':maid'] = False


def is_deck_empty(room):
    return len(s['room:' + room + ':deck']) == 0


@app.route('/fold', methods=['POST', 'GET'])
def fold():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    if not is_player_fold_or_use_card_valid(room, player):
        return 'Invalid card!'
    card_fold_or_use(room, player, request.args.get('card'))
    return redirect(url_for('show', room=room, player=request.args.get('player')))


@app.route('/use', methods=['POST', 'GET'])
def use():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    if not is_player_fold_or_use_card_valid(room, player):
        return 'Invalid card!'

    need = check(room, player, request.args.get('card'), \
                 request.args.get('chosenPlayer'), request.args.get('chosenCard'))
    if need:
        card_fold_or_use(room, player, request.args.get('card'))
    return redirect(url_for('show', room=room, player=request.args.get('player')))


def check(room, player, card, chosenPlayer = None, chosenCard = None):
    if "King" in s['room:' + room + ':player:' + player + ':hand'] \
        and "Countess" in s['room:' + room + ':player:' + player + ':hand']:
        return countess(room, player)
    elif "Princess" in s['room:' + room + ':player:' + player + ':hand'] \
        and "Countess" in s['room:' + room + ':player:' + player + ':hand']:
        return countess(room, player)
        # Todo how to deal with countess case if user throw wrong card (deal with it at frontend?)
    elif card == "King" and chosenPlayer:
        return king(room, player, chosenPlayer)
    elif card == "Princess":
        return princess(room, player)
    elif card == "Guard" and chosenCard and chosenPlayer:
        return guard(room, player, chosenPlayer, chosenCard)
    elif card == "Prince" and chosenPlayer:
        return prince(room, player, chosenPlayer)
    elif card == "Baron" and chosenPlayer:
        return baron(room, player, chosenPlayer)
    elif card == "Handmaid":
        return handmaid(room, player)
    elif card == "Priest" and chosenPlayer:
        return priest(room, player, chosenPlayer, card)
    return "Unknown Card"


#Return False means not need to call card_fold_or_use function
#Return True means need to call card_fold_or_use function
def princess(room, player):
    for card in s['room:' + room + ':player:' + player + ':hand']:
        s['room:' + room + ':fold_deck'].append(card)
        s['room:' + room + ':player:' + player + ':fold_deck'].append(card)
    s['room:' + room + ':player:' + player + ':hand'] = []
    s['room:' + room + ':player:' + player + ':out'] = True
    return False


# Throw the card first, then exchange the card
def king(room, player, chosenPlayer):
    if s['room:' + room + ':player:' + chosenPlayer + ':maid']:
        return "The player is protected by maid"
    if is_all_player_except_player_protected_by_maid(room, player):
        return True
    card_fold_or_use(room, player, "King")
    temp = s['room:' + room + ':player:' + player + ':hand']
    s['room:' + room + ':player:' + player + ':hand'] = s['room:' + room + ':player:' + chosenPlayer + ':hand']
    s['room:' + room + ':player:' + chosenPlayer + ':hand'] = temp
    return False


def guard(room, player, chosenPlayer, chosenCard):
    if s['room:' + room + ':player:' + chosenPlayer + ':maid']:
        return "The player is protected by maid"
    if is_all_player_except_player_protected_by_maid(room, player):
        return True
    if s['room:' + room + ':player:' + chosenPlayer + ':hand'] == chosenCard:
        princess(room, chosenPlayer)
    return True


def priest(room, player, chosenPlayer, card): # if protected by maid
    # TODO how to send information back
    card_fold_or_use(room, player, card)
    return redirect(url_for('result', room=room, player=player, chosenPlayer=chosenPlayer))


def prince(room, player, chosenPlayer):
    if s['room:' + room + ':player:' + chosenPlayer + ':maid']:
        return "The player is protected by maid"
    for card in s['room:' + room + ':player:' + chosenPlayer + ':hand']:
        if card == "Princess":
            return princess(room, chosenPlayer)
        s['room:' + room + ':fold_deck'].append(card)
        s['room:' + room + ':player:' + player + ':fold_deck'].append(card)
    s['room:' + room + ':player:' + chosenPlayer + ':hand'] = []
    card = draw_one_card_from_deck(room)
    player_add_one_card(room, chosenPlayer, card)
    return True


def baron(room, player, chosenPlayer):
    if is_all_player_except_player_protected_by_maid(room, player):
        return True
    if s['room:' + room + ':player:' + chosenPlayer + ':maid']:
        return "The player is protected by maid"
    if card_num[s['room:' + room + ':player:' + player + ':hand']] \
            > card_num[s['room:' + room + ':player:' + chosenPlayer + ':hand']]:
        princess(room, chosenPlayer)
    elif card_num[s['room:' + room + ':player:' + player + ':hand']] \
            < card_num[s['room:' + room + ':player:' + chosenPlayer + ':hand']]:
        princess(room, player);
    return False


def countess(room, player):
    return True


def handmaid(room, player):
    s['room:' + room + ':player:' + player + ':maid'] = True
    return True


def is_all_player_except_player_protected_by_maid(room, player):
    for otherPlayer in s['room:' + room + ':player']:
        if otherPlayer == player or s['room:' + room + ':player:' + otherPlayer + ':out']: # if the player is out
            continue
        if not s['room:' + room + ':player:' + otherPlayer + ':maid']:
            return False
    return True

def is_player_fold_or_use_card_valid(room, player):
    if not request.args.get('card'):
        return False
    return request.args.get('card') in s['room:' + room + ':player:' + player + ':hand']


def card_fold_or_use(room, player, card):
    s['room:' + room + ':player:' + player + ':hand'].remove(card)
    s['room:' + room + ':fold_deck'].append(card)
    s['room:' + room + ':player:' + player + ':fold_deck'].append(card)


@app.route('/show', methods=['POST', 'GET'])
def show():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    data = {"player": player, "cards": s['room:' + room + ':player:' + player + ':hand'], "fold":[{"player": i, "fold": s['room:' + room + ':player:' + player + ':fold_deck']}
                    for i in s['room:' + room + ':player']]}
    return jsonify(data)

@app.route('/result', methods=['POST', 'GET'])
def result():
    room = request.args.get('room')
    player = s['player_token:' + request.args.get('player')]
    chosenPlayer = s['player_token:' + request.args.get('chosenPlayer')]
    data = {"player": player, "cards": s['room:' + room + ':player:' + player + ':hand'], "fold": [{"player": i, "fold": s['room:' + room + ':player:' + player + ':fold_deck']}
                    for i in s['room:' + room + ':player']], chosenPlayer: s['room:' + room + ':player:' + chosenPlayer + ':hand']}
    return jsonify(data)

@app.route('/')
def home():
    return "Welcome to love letter!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
