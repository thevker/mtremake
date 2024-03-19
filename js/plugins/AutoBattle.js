/*:
 * @target MZ
 * @plugindesc 自动战斗
 * @author 魏玉龙
 *
 * @param enabled
 * @text 自动战斗开关
 * @type boolean
 * @on 启用
 * @off 禁用
 * @default true
 * @desc 是否开启自动战斗
 *
 * @param command
 * @text 命令文字
 * @type string
 * @desc 命令显示文字
 * @default 自动
 *
 * @param continous
 * @text 连续自动战斗
 * @type boolean
 * @on 连续
 * @off 不连续
 * @desc 是否连续的自动战斗
 * @default false
 *
 * @param skipMessage
 * @text 跳过消息
 * @type boolean
 * @on 跳过
 * @off 不跳过
 * @desc 跳过战斗中的消息
 * @default false
 *
 * @command set
 * @text 自动战斗状态设置
 * @desc 设置自动战斗的各种状态。
 *
 * @arg enabled
 * @text 自动战斗开关
 * @type boolean
 * @on 启用
 * @off 禁用
 * @default true
 * @desc 是否开启自动战斗
 *
 * @arg continous
 * @text 连续自动战斗
 * @type boolean
 * @on 连续
 * @off 不连续
 * @desc 是否连续的自动战斗
 * @default false
 *
 * @arg skipMessage
 * @text 跳过消息
 * @type boolean
 * @on 跳过
 * @off 不跳过
 * @desc 跳过战斗中的消息
 * @default false
 *
 * @help
 * 此插件提供以下插件命令：
 *
 * AutoBattle enable
 *   开启自动战斗
 *
 * AutoBattle disable
 *   关闭自动战斗
 *
 * AutoBattle continous true/false
 *   是否开启连续的自动战斗
 *
 * AutoBattle skipMessage true/false
 *   是否跳过战斗中的消息
 *
 */

;(() => {
  const pluginName = document.currentScript.src.match(/.+\/(.+)\.js/)[1]
  const parameters = PluginManager.parameters(pluginName)
  let autoBattle = {
    enabled: JSON.parse(parameters['enabled'] || true),
    command: String(parameters['command' || 'auto']),
    continous: JSON.parse(parameters['continous'] || false),
    skipMessage: JSON.parse(parameters['skipMessage'] || false),
  }

  const _Game_Temp_initialize = Game_Temp.prototype.initialize
  Game_Temp.prototype.initialize = function () {
    _Game_Temp_initialize.call(this)
    this._continousAutoBattle = false
  }

  const _Game_BattlerBase_isAutoBattle = Game_BattlerBase.prototype.isAutoBattle
  Game_BattlerBase.prototype.isAutoBattle = function() {
    if($gameTemp._continousAutoBattle){
      return true
    }else{
      return _Game_BattlerBase_isAutoBattle.call(this)
    }
  }

  const _Scene_Battle_update = Scene_Battle.prototype.update
  Scene_Battle.prototype.update = function () {
    _Scene_Battle_update.call(this)
    if ($gameTemp._continousAutoBattle && (Input.isTriggered('escape') || Input.isTriggered('cancel'))) {
      SoundManager.playCancel()
      $gameTemp._continousAutoBattle = false
    }
  }

  const _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows
  Scene_Battle.prototype.createAllWindows = function () {
    if (!autoBattle.continous) {
      $gameTemp._continousAutoBattle = false
    }
    _Scene_Battle_createAllWindows.call(this)
  }

  const _Scene_Battle_createPartyCommandWindow = Scene_Battle.prototype.createPartyCommandWindow
  Scene_Battle.prototype.createPartyCommandWindow = function () {
    _Scene_Battle_createPartyCommandWindow.call(this)
    if (autoBattle.enabled) {
      this._partyCommandWindow.setHandler('auto', this.commandAutoBattle.bind(this))
    }
  }

  const _Scene_Battle_startPartyCommandSelection = Scene_Battle.prototype.startPartyCommandSelection
  Scene_Battle.prototype.startPartyCommandSelection = function () {
    if ($gameTemp._continousAutoBattle && !SceneManager.isSceneChanging()) {
      this.commandAutoBattle.call(this)
    } else {
      _Scene_Battle_startPartyCommandSelection.call(this)
    }
  }
  Scene_Battle.prototype.commandAutoBattle = function () {
    $gameParty.battleMembers().forEach(function (member) {
      if (member.canInput()) {
        member.makeAutoBattleActions()
        if (BattleManager.isTpb()) {
          member.startTpbCasting()
        }
      }
    })
    $gameTemp._continousAutoBattle = true
    this.endCommandSelection()
    BattleManager.startTurn()
  }
  Scene_Battle.prototype.refreshAutobattlerStatusWindow = function () {
    $gameParty.battleMembers().forEach(function (member) {
      if (member.isAutoBattle()) {
        this._statusWindow.drawItem(member.index)
      }
    })
  }

  const _Window_Message_startPause = Window_Message.prototype.startPause
  Window_Message.prototype.startPause = function () {
    if ($gameParty.inBattle() && $gameTemp._continousAutoBattle && autoBattle.skipMessage) {
      this.terminateMessage()
    } else {
      _Window_Message_startPause.call(this)
    }
  }

  const _Window_PartyCommand_makeCommandList = Window_PartyCommand.prototype.makeCommandList
  Window_PartyCommand.prototype.makeCommandList = function () {
    _Window_PartyCommand_makeCommandList.call(this)
    if (autoBattle.enabled) {
      this.addCommand(autoBattle.command, 'auto')
    }
  }

  PluginManager.registerCommand(pluginName, 'set', (args) => {
    for (let [key, value] of Object.entries(args)) {
      autoBattle[key] = value
    }
  })
})()
