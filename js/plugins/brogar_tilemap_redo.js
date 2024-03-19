//=============================================================================
 /*:
@title brogar_tilemap_redo
@plugindesc Gives support for tilesizes larger than 64x64
@author Brogar
@filename brogar_tilemap_redo.js

@help
This plugin is licensed under LGPL3, 
see https://www.gnu.org/licenses/lgpl-3.0.html

Most of the Code of this plugin is directly from RPGMaker MZ, 
so the MZ license is included as well.
The plugin does not work with RPGMaker MV.

---------

Step by step:
- Open your project

- Set the plugin active and select the needed tilesize there

- Choose if you want to use rectangular tiles (experimental)
  Warning: This will look strange in the editor
  
- provide the right size tileset in img/tilesets

- playtest, close game and editor and reopen the editor

- Enjoy your large tilesets...

---------

This plugin will change the texture size of the Tilemap to accomodate the
Tilesize you want to use. Enter any number up to 512, the plugin will 
automatically determine the correct texture size to use for the tilesize.

---------

Some warnings:
This plugin will increase the needed RAM of RPGMaker MZ, since it will
allocate larger textures.

Some machines will not run tilesizes much larger than 128x128 
(mostly very old graphics cards, older smartphones, ...)

If the plugin cannot make sense of your input (for example you set 
tilesize to "hello") it will select the texture size
corresponding to a tilesize of 48 and set the tilesize to 48

Using rectangular tilesizes is highly experimental and will look strange
in the editor, it seems to work fine ingame

For Sizes larger than 512, the texture size for 512 will be used, because
that is the maximum texture size supported by WebGL at the moment of
writing the plugin (16384x16384).

---------

Version info:
v1.3 - add rectangular tiles
v1.2 - set tilesize in System.json from within the plugin
v1.1 - bugfix
v1.0 - initial release
-------------------------------------------------------------------------
@param Tilesize1
@default 48
@desc Input the tile width you wish to use

@param Allow rectangular tiles
@default false
@desc Experimental: will allow tiles that are not square, for example 100x80

@param Tileheight1
@default 48
@desc Input the tile height you wish to use, if Allow rectangular tiles is on
-------------------------------------------------------------------------
*/

var Imported = Imported || {};
var brogar_tilemap_redo = brogar_tilemap_redo || {};
Imported.brogar_tilemap_redo = 1;
var brogar_tilemap_redo = true;
//var brogar_texturesize = 2048;
var brogar_params = {};
var brogar_tmr_texturesize1 = 0;
var brogar_tmr_tilesize = 0;
var brogar_tmr_allowrect = false;
var brogar_tmr_tileheight = 0;
var brogar_tmr_sizecompare = 0;

(function ($) {

// -------------------------------------
// -- Calculate correct texture sizes --
// -------------------------------------
   $._interpreter = new Game_Interpreter();
   brogar_tmr_params = PluginManager.parameters('brogar_tilemap_redo');
   brogar_tmr_tilesize = parseInt(brogar_tmr_params['Tilesize1']) || 48;
   brogar_tmr_allowrect = brogar_tmr_params['Allow rectangular tiles'] || false;
   brogar_tmr_tileheight = parseInt(brogar_tmr_params['Tileheight1']) || 48;
   brogar_tmr_texturesize1 = 0;
   if (brogar_tmr_tilesize<1) brogar_tmr_tilesize = 1;
   if (brogar_tmr_tilesize>16384) brogar_tmr_tilesize = 16384;
   if (brogar_tmr_tileheight<1) brogar_tmr_tileheight = 1;
   if (brogar_tmr_tileheight>16384) brogar_tmr_tileheight = 16384;
   if (brogar_tmr_allowrect == true) {
      brogar_tmr_sizecompare = Math.max(brogar_tmr_tilesize,brogar_tmr_tileheight);
   } else brogar_tmr_sizecompare = brogar_tmr_tilesize;
// size for tilesizes 129 - 256
   if (brogar_tmr_sizecompare <= 256) brogar_tmr_texturesize1 =  8192; 
// size for tilesizes 65 - 128
   if (brogar_tmr_sizecompare <= 128) brogar_tmr_texturesize1 =  4096; 
// default size for MZ
   if (brogar_tmr_sizecompare <= 64)  brogar_tmr_texturesize1 =  2048; 
// when not set, set max WebGL texturesize, will capture wrong inputs or anything above 256
   if (brogar_tmr_texturesize1 == 0) brogar_tmr_texturesize1 = 16384; 
   console.log(brogar_tmr_texturesize1+" - "+brogar_tmr_tilesize+" - "+brogar_tmr_tileheight);

// -------------------------------
// -- Changes Tilemap behaviour --
// -------------------------------

Tilemap.Layer.prototype._updateVertexBuffer = function() {
    const numElements = this._elements.length;
    const required = numElements * Tilemap.Layer.VERTEX_STRIDE;
    if (this._vertexArray.length < required) {
        this._vertexArray = new Float32Array(required * 2);
    }
    const vertexArray = this._vertexArray;
    let index = 0;
    for (const item of this._elements) {
        const setNumber = item[0];
        const tid = setNumber >> 2;
        const sxOffset = brogar_tmr_texturesize1 / 2 * (setNumber & 1);
        const syOffset = brogar_tmr_texturesize1 / 2 * ((setNumber >> 1) & 1);
        const sx = item[1] + sxOffset;
        const sy = item[2] + syOffset;
        const dx = item[3];
        const dy = item[4];
        const w = item[5];
        const h = item[6];
        const frameLeft = sx + 0.5;
        const frameTop = sy + 0.5;
        const frameRight = sx + w - 0.5;
        const frameBottom = sy + h - 0.5;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx + w;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx + w;
        vertexArray[index++] = dy + h;
        vertexArray[index++] = tid;
        vertexArray[index++] = frameLeft;
        vertexArray[index++] = frameTop;
        vertexArray[index++] = frameRight;
        vertexArray[index++] = frameBottom;
        vertexArray[index++] = sx;
        vertexArray[index++] = sy + h;
        vertexArray[index++] = dx;
        vertexArray[index++] = dy + h;
    }
    this._vertexBuffer.update(vertexArray);
};/**/

Tilemap.Renderer.prototype.initialize = function(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
    this._shader = null;
    this._images = [];
    this._internalTextures = [];
    this._clearBuffer = new Uint8Array(brogar_tmr_texturesize1 * brogar_tmr_texturesize1);
    this.contextChange();
};/**/
/**/
Tilemap.Renderer.prototype._createShader = function() {
    const vertexSrc =
        "attribute float aTextureId;" +
        "attribute vec4 aFrame;" +
        "attribute vec2 aSource;" +
        "attribute vec2 aDest;" +
        "uniform mat3 uProjectionMatrix;" +
        "varying vec4 vFrame;" +
        "varying vec2 vTextureCoord;" +
        "varying float vTextureId;" +
        "void main(void) {" +
        "  vec3 position = uProjectionMatrix * vec3(aDest, 1.0);" +
        "  gl_Position = vec4(position, 1.0);" +
        "  vFrame = aFrame;" +
        "  vTextureCoord = aSource;" +
        "  vTextureId = aTextureId;" +
        "}";
    const fragmentSrc =
        "varying vec4 vFrame;" +
        "varying vec2 vTextureCoord;" +
        "varying float vTextureId;" +
        "uniform sampler2D uSampler0;" +
        "uniform sampler2D uSampler1;" +
        "uniform sampler2D uSampler2;" +
        "void main(void) {" +
        "  vec2 textureCoord = clamp(vTextureCoord, vFrame.xy, vFrame.zw);" +
        "  int textureId = int(vTextureId);" +
        "  vec4 color;" +
        "  if (textureId < 0) {" +
        "    color = vec4(0.0, 0.0, 0.0, 0.5);" +
        "  } else if (textureId == 0) {" +
        "    color = texture2D(uSampler0, textureCoord / "+brogar_tmr_texturesize1+".0);" +
        "  } else if (textureId == 1) {" +
        "    color = texture2D(uSampler1, textureCoord / "+brogar_tmr_texturesize1+".0);" +
        "  } else if (textureId == 2) {" +
        "    color = texture2D(uSampler2, textureCoord / "+brogar_tmr_texturesize1+".0);" +
        "  }" +
        "  gl_FragColor = color;" +
        "}";

    return new PIXI.Shader(PIXI.Program.from(vertexSrc, fragmentSrc), {
        uSampler0: 0,
        uSampler1: 0,
        uSampler2: 0,
        uProjectionMatrix: new PIXI.Matrix()
    });
};
/**/
Tilemap.Renderer.prototype._createInternalTextures = function() {
    this._destroyInternalTextures();
    for (let i = 0; i < Tilemap.Layer.MAX_GL_TEXTURES; i++) {
        const baseTexture = new PIXI.BaseRenderTexture();
        baseTexture.resize(brogar_tmr_texturesize1, brogar_tmr_texturesize1);
        baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        this._internalTextures.push(baseTexture);
    }
};/**/

Tilemap.Renderer.prototype.updateTextures = function(renderer, images) {
    for (let i = 0; i < images.length; i++) {
        const internalTexture = this._internalTextures[i >> 2];
        renderer.texture.bind(internalTexture, 0);
        const gl = renderer.gl;
        const x = brogar_tmr_texturesize1 / 2 * (i % 2);
        const y = brogar_tmr_texturesize1 / 2 * ((i >> 1) % 2);
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        // prettier-ignore
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, brogar_tmr_texturesize1 / 2, brogar_tmr_texturesize1 / 2, format, type,
                         this._clearBuffer);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, format, type, images[i]);
    }
};/**/

// ----------------------------------------------------------------------
// -- Incorporate automatic tilesize switching --------------------------
// -- ( implemented from changesize plugin by shaz with his permission --
// ----------------------------------------------------------------------
Game_Map.prototype.tileWidth = function() {
    if (typeof brogar_tmr_tilesize !== "undefined") {
        return brogar_tmr_tilesize;
    } else {
        return 48;
    }
};/**/

Game_Map.prototype.tileHeight = function() {
    if (brogar_tmr_allowrect == "true") {
        return brogar_tmr_tileheight;
    } else return this.tileWidth();
};/**/

  var brogar_SceneManager_goto = SceneManager.goto;
  SceneManager.goto = function(sceneClass) {
      if (sceneClass === Scene_Title) {
      if (Utils.isOptionValid("test")) {
          if ($dataSystem.tileSize != brogar_tmr_tilesize) {
              $dataSystem.tileSize = brogar_tmr_tilesize;
    //          DataManager.saveSystemData();
          }
      }
      }
      brogar_SceneManager_goto.call(this, sceneClass);
  }/**/

DataManager.saveSystemData = function() {
  var json = JSON.stringify($dataSystem);
  const fs = require('fs');
  fs.writeFile("./data/System.json", json, function(err) {
    if(err) {
        return console.log("brogar_tilemap_redo: Error while updating System.json: "+err);
    }
  });
};/**/


// ----------------
// -- Script End --
// ----------------
})(brogar_tilemap_redo);