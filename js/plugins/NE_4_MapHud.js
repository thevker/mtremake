//=============================================================================
// Nebula Games Plugins - MZ - Simple On Map Hud showing basic data;
// NE_4_MapHud.js   VERSION 1.00
//=============================================================================

var Imported = Imported || {};
Imported.NE_4_MapHud = true;

var Nebula = Nebula || {};
Nebula.MapHud = Nebula.MapHud || {};

//=============================================================================
 /*:
 * @target MZ
 * @URL https://nebula-games.itch.io/leader-map-hud
 * @plugindesc v1.00 Simple on-map HUD showing Party's leader Face, HP, MP, EXPs etc..
 * @author Nebula Games
 * @help
 * CHANGELOG:
 * VERSION 1.00: Plugin Released!
 *
 *==============================================================================
 * GENERAL
 *==============================================================================
 *
 * NE_4_MapHud.js creates a default on-map hud showing some information related
 * to the current party's leader. The HUD auto-updates itself each time when
 * one of the related data is altered.
 *
 *==============================================================================
 * PLUGIN COMMANDS
 *==============================================================================
 *
 * The plugin is provided by two plugin commands for showing and hiding the
 * HUD. They are :
 *
 * Map Hud: Show -> This command shows the map hud that has been hidden.
 * Map Hud: Hide -> This command hides the map hud.
 *
 * Moreover, the HUD automatically hides itself when the player collides with
 * it during max exploration for avoiding visiblity issues.
 *
 * @param Hud Placement
 * @desc This is the [x,y] coordinate of the HUD;
 * @type number[]
 * @default ["0", "0"]
 *
 * @=============================================================================
 * @-- PLUGIN COMMANDS --
 *
 * @command Show_Map_Hud
 * @text Map Hud: Show
 * @desc Show the Map HUD;
 *
 * @command Hide_Map_Hud
 * @text Map Hud: Hide
 * @desc Hide the Map HUD;
 *
 */
 //=============================================================================

(function($) {

	const Parameters = PluginManager.parameters("NE_4_MapHud");
	$._window_coordinates = JSON.parse(Parameters["Hud Placement"]).map(Number);

	//###############################################################################
	//
	// PLUGIN COMMANDS
	//
	//###############################################################################

	PluginManager.registerCommand("NE_4_MapHud", "Show_Map_Hud", () => {
		const scene = SceneManager._scene;
		$gameSystem._setMapHud(true);
		scene._spriteset._mapHud.open();
	});
	PluginManager.registerCommand("NE_4_MapHud", "Hide_Map_Hud", () => {
		const scene = SceneManager._scene;
		$gameSystem._setMapHud(false);
		scene._spriteset._mapHud.close();
	});

	//###############################################################################
	//
	// GAME SYSTEM
	//
	//###############################################################################

	Game_System = class extends window.Game_System {

		initialize() {
			super.initialize();
			this._mapHudVisible = true;
		}

		_setMapHud(visible) {
			return this._mapHudVisible = visible;
		}
	}

	//###############################################################################
	//
	// WINDOW HUD
	//
	//###############################################################################

	class Window_MapHud extends Window_StatusBase {

		initialize(rect) {
			super.initialize(rect);
			this.opacity = 0;
			this._data = ["",0,0,0];
			if(!$gameSystem._mapHudVisible) {this.openness = 0;}
		}

		_checkLeaderData() {
			let leader = $gameParty.leader();
			if(leader.faceName() !== this._data[0]) {
				let bitmap = ImageManager.loadFace(leader.faceName());
				if(!bitmap.isReady()) {return false;}
				return true;
			}
			if(leader.hp !== this._data[1]) {return true;}
			if(leader.mp !== this._data[2]) {return true;}
			if(leader.currentExp() !== this._data[3]) {return true;}
			return false;
		}

		updateAutoHiding() {
			let player = $gamePlayer;
			if(player.screenX() <= this.x + this.width && player.screenY() <= this.y + this.height) {
				if(this.alpha > 0) {this.alpha = Math.max(this.alpha - 0.1 * SceneManager._smoothDeltaTime, 0)} 
			}
			else {
				if(this.alpha < 1) {this.alpha = Math.min(this.alpha + 0.1 * SceneManager._smoothDeltaTime, 1)} 
			}
		}

		update() {
			super.update();
			this.needsRefresh();
			this.updateAutoHiding();
		}

		needsRefresh() {
			let leader = $gameParty.leader();
			if(!this._checkLeaderData()) {return;}
			this.refresh();
		}

		refresh() {
			this.contents.clear();
			let leader = $gameParty.leader();
			this.drawActorFace(leader,0,this.lineHeight() / 4, ImageManager.faceWidth, ImageManager.faceHeight / 2);
			this.drawText(`${leader.name()} - Lv.${leader.level}`, ImageManager.faceWidth + 5, 0, this.contents.width - (ImageManager.faceWidth + 5), "left");
			this.placeGauge(leader, "hp", ImageManager.faceWidth + 5, this.lineHeight());
			this.placeGauge(leader, "mp", ImageManager.faceWidth + 5, this.lineHeight() + this.gaugeLineHeight());
			// Refresh Data
			this._data = [leader.faceName(), leader.hp, leader.mp, leader.currentExp()];
		}
	}

	//###############################################################################
	//
	// SPRITESET MAP
	//
	//###############################################################################

	Spriteset_Map = class extends window.Spriteset_Map {

		_mapHudRectangle() {
			return new Rectangle(0,0,Math.floor(Graphics.width / 2.5), Math.floor(Graphics.height / 4))
		}

		createLowerLayer() {
			super.createLowerLayer();
			this.createMapHud();
		}

		createMapHud() {
			this._mapHud = new Window_MapHud(this._mapHudRectangle());
			this._mapHud.position.set(...$._window_coordinates);
			this._baseSprite.addChild(this._mapHud);
		}
	}

})(Nebula.MapHud);
