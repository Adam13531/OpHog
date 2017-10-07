OpHog (play [here](http://ophog.bot.land/)!)
=====
OpHog is an HTML5/JavaScript game resembling Tower Defense. You can play it here: http://ophog.bot.land/

Some screenshots are here: http://imgur.com/a/rjbPH

# Game information 
## History
A friend and I started working on this game in December 2012. We set out to create something fun and we didn't care whether we made money (we both had full-time jobs). The first commit to this repository wasn't made until March since we needed to design the game and then learn JavaScript.

Work continued for nearly a year and a half until we got to this point. The game is relatively complete, although there's definitely still polish missing. I think it can serve as a good learning tool for other people trying to make a game. I still highly suggest that you use an existing game engine instead of making your own from scratch.

[Here](http://imgur.com/a/ZSjED) are some in-dev screenshots.

## How to play
In OpHog, you place units in order to defeat the enemy boss of each world while defending your portals. You can buy items in the shop with your diamonds, then use your inventory to equip them to your units or use them.

Some keyboard shortcuts:
* I - open inventory
* Y - open shop
* R (in-world only) - place all unplaced units
* Left/right - choose different unit (then press spacebar to buy or place)
* Up/down - choose different spawner

# Code information

## Overall design
We didn't know JavaScript before starting this project, so the code isn't perfect by any means. Some notes:
- Every file's code is contained in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)
- The "namespace" we use is "window.game.FOO"
- There are "managers" that are responsible for drawing/updating entities. For example, there's a CollectibleManager which keeps track of where treasure chests and barrels are.
- [Hammer.js](http://eightmedia.github.io/hammer.js/) is the library we used for touch gestures like drag or pinch
- JQueryUI is used for all HTML-based UI (as opposed to canvas-based UI like loot notifications). To allow for multiple themes, all JQueryUI elements are in their own divs themed with class="le-frog".

## How to...
(this section has specific instructions on how to perform each task)

### ...set up Aptana
I used [Aptana](http://aptana.com/) for setting up a webserver on my machine, although I did my actual coding using [Sublime](http://www.sublimetext.com/). To set up Aptana, do the following:
* **File** → **New** → **Project** (Project type: "General")
* Uncheck **Use default location** and point it directly at your git repository
* To set up Aptana to use index.html, go to **Run** → **Run Configurations...** → **Web Browser** → (choose your browser)
* Under **Start Action** → **Specific page**, browse to src/index.html.
* Test the above by clicking **Run**. If it worked, your browser will open to OpHog.

### ...set up Sublime
You don't need to do much to set up Sublime. I only did two things:

1. Add folders to your project under **Project** → **Add Folder to Project...**. This allows ctrl+P to work in navigating between files.
2. Add a script that will launch index.html when you press a certain shortcut.

First, save the script below as open_index_html.py in your User Packages folder (to get to this folder, go to **Preferences** → **Browser Packages...** from Sublime, then open your User folder).
```python
import sublime, sublime_plugin, webbrowser

class OpenIndexHtmlCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		if (self.view.is_dirty()) :
			pass 

    # Modify the URL below to be whatever shows in your browser's address bar when you run your project from Aptana.
		webbrowser.open("http://127.0.0.1:1200/OpHogAptanaProject/src/index.html")
```

Next, open your key bindings (**Preferences** → **Key Bindings — User**) and add the following:
```json
{ "keys": ["keypad_minus"], "command": "open_index_html" },
```

Now you'll be able to use Sublime as your editor and then press numpad_minus to view the up-to-date project. For this to work, you need to have run your project once with Aptana first, and the Aptana project still needs to be open.

### ...add units (e.g. new enemies)
UnitData.js has all of this data. Units are very customizable even though I didn't do much to customize the ones that I added to the game! To add a new unit, simply make a new object in window.game.UnitType and follow the explanatory comment at the top. Some notes:
* Most errors will be caught automatically when you run the game. For example, if you copy/pasted a unit and forgot to change its ID, you'd see "Check console log - duplicate unit ID detected.".
* Very little is actually needed to define a unit, just id, graphicIndexes, and statClass. The rest are all filled in automatically, but you can override them if you want.
 * To find the specific graphic index for a particular unit, look at GraphicIndexConstants.js; I think I documented them all already (search for "char_24.png").
 * FYI: graphicIndexes is an array because you _used_ to be able to specify 1x2, 2x1, or 2x2 units, but that's no longer the case and it's still an array (always of length==1).
 * All units are animated automatically by virtue of how the char_24.png is laid out. If you add your own unit graphics, then frame 1 of the animation must appear directly above frame 2.
* All units are given game.Ability.ATTACK regardless of whether you specify it. This is so that battles couldn't last forever (imagine an enemy that only ever healed itself against one of your units that didn't do enough damage to kill it).

### ...add items mods
Adding items is so similar to adding units (except it's in ItemData.js) that I'll instead talk about adding item _mods_.

1. Make a new mod file in src/js/item/mod. I usually copy/paste another mod file entirely.
2. Add a reference to the file in index.html using a \<script\> tag.
3. Add a new game.ItemModType in ItemMod.js.
4. Change ItemMod.rehydrateMods so that the mod can be loaded properly.

As you can see from ItemMod.js, there are four events that can trigger mods:
* beforeReceiveDamage - this happens when you're about to take damage, so this can change the amount that you'll take. Perhaps there's a mod that cuts the damage you take in half; simply return damageToBeDealt / 2.
* onDamageDealt - this happens when you deal damage. It can't actually change the damage that you're about to deal, but it can be used for something like leeching life.
* onDamageReceived - this happens after you've taken damage, so your unit may actually be dead at this point.
* onBattleTurn - this can be used to modify your attack; it's what MultipleProjectiles uses.

### ...modify the overworld map
I used [Tiled](http://www.mapeditor.org/) to make the world map, but the process is a little circuitous:
* Open src/tools/overworld.tmx in Tiled.
* Modify the map as you please. To change walkability, enable the layer in the Layers panel and put any tile whatsoever in a position to indicate that a tile is walkable.
* Save the map. Make sure you're exporting data as CSV (**Edit** → **Preferences...** → **Store tile layer data as: CSV**)
* Run src/tools/tmx_parser.py like this:
```shell
cd src/tools
python tmx_parser.py overworld.tmx overworld.txt
```
* Copy/paste the contents of overworld.txt into OverworldMap.js, overwriting all the way from overworldMapTileIndices to the end of overworldWalkability.

### ...add a book
There are books on the overworld. To add a new one:
* Follow the steps above on modifying the overworld map so that the book graphic shows where you want
* Add a new entry to bookInfo in BookManager.js
* Add another "else if" to openBookIfOneExistsHere

## How to publish
The easy way to publish the game is simply to copy all of the files to your webserver. The harder/better way is to minify everything. I made a script to help with that process (src/tools/publisher.py), but it's not good by any means. It goes through index.html and finds JavaScript files, concatenates them all into a single file, then minifies the result. After that, it pastes in all of the licenses since they would no longer be intact. It requires [node.js](http://nodejs.org/), [UglifyJS](https://github.com/mishoo/UglifyJS), Java, and [YUICompressor](http://yui.github.io/yuicompressor/).

```shell
python publisher.py ..\index.html index.html "C:\UglifyJS-master\bin\uglifyjs" ../src
```

Despite sucking, the script is relatively well commented, so I'm not going to explain the above args. You should probably find a better way than I used to publish. :|

UPDATE (10/6/2017): wow, this took a stupidly long time to figure out again. Surprisingly though, I got it to work. I ran "publish.cmd" with a path pointing to a `git clone`'d UglifyJS's `UglifyJS\bin\uglifyjs\`. It produced a bunch of files that I manually copied so that the folder structure looked like this (focus on the JS and CSS folders):

```
│   index.html
│
├───res
│   ├───img
│   │   │   black_slot.png
│   │   │   blue_slot.png
│   │   │   char_24.png
│   │   │   eff_24.png
│   │   │   eff_32.png
│   │   │   env_24.png
│   │   │   green_slot.png
│   │   │   icon_16.png
│   │   │   img_trans.png
│   │   │   item_32.png
│   │   │   purple_slot.png
│   │   │   red_slot.png
│   │   │   reversed_creature_key.txt
│   │   │   slot.png
│   │   │   slot2.png
│   │   │   trans-green.png
│   │   │   trans-red.png
│   │   │
│   │   └───oryx_16-bit_fantasy_1.1
│   │       │   creature_key.doc
│   │       │   oryx_16bit_background.png
│   │       │   oryx_16bit_background_trans.png
│   │       │   oryx_16bit_fantasy_classes.png
│   │       │   oryx_16bit_fantasy_classes_trans.png
│   │       │   oryx_16bit_fantasy_creatures.png
│   │       │   oryx_16bit_fantasy_creatures_trans.png
│   │       │   oryx_16bit_fantasy_fx.png
│   │       │   oryx_16bit_fantasy_fx_trans.png
│   │       │   oryx_16bit_fantasy_items.png
│   │       │   oryx_16bit_fantasy_items_trans.png
│   │       │   oryx_16bit_fantasy_tiles.png
│   │       │   oryx_16bit_fantasy_world.png
│   │       │   oryx_16bit_fantasy_world_trans.png
│   │       │   oryx_16bit_mockup.png
│   │       │   oryx_license.txt
│   │       │
│   │       └───TMX Source
│   │           │   oryx_creatures.png
│   │           │   oryx_fx.png
│   │           │   oryx_items.png
│   │           │   oryx_tiles.png
│   │           │   oryx_world.png
│   │           │   oryx_world2.png
│   │           │
│   │           └───TMX
│   │                   oryx_16-bit_fantasy_test.tmx
│   │
│   ├───music
│   │       new3.mp3
│   │
│   ├───sound
│   │       blip1.mp3
│   │       explode1.mp3
│   │       explode2.mp3
│   │       explode3.mp3
│   │       hit1.mp3
│   │       pickup1.mp3
│   │       powerup1.mp3
│   │       powerup2.mp3
│   │       rename_m4a_to_mp4.cmd
│   │
│   └───soundmanager2_swf
│           soundmanager2.swf
│           soundmanager2_debug.swf
│           soundmanager2_flash9.swf
│           soundmanager2_flash9_debug.swf
│           soundmanager2_flash_xdomain.zip
│
└───src
    ├───css
    │   │   main.min.css
    │   │   normalize.min.css
    │   │
    │   └───ui
    │       └───le-frog
    │           │   jquery-ui-1.10.2.custom.css
    │           │   jquery-ui-1.10.2.custom.min.css
    │           │
    │           └───images
    │                   animated-overlay.gif
    │                   ui-bg_diagonals-small_0_aaaaaa_40x40.png
    │                   ui-bg_diagonals-thick_15_444444_40x40.png
    │                   ui-bg_diagonals-thick_95_ffdc2e_40x40.png
    │                   ui-bg_glass_55_fbf5d0_1x400.png
    │                   ui-bg_highlight-hard_30_285c00_1x100.png
    │                   ui-bg_highlight-soft_33_3a8104_1x100.png
    │                   ui-bg_highlight-soft_50_4eb305_1x100.png
    │                   ui-bg_highlight-soft_60_4ca20b_1x100.png
    │                   ui-bg_inset-soft_10_285c00_1x100.png
    │                   ui-icons_4eb305_256x240.png
    │                   ui-icons_72b42d_256x240.png
    │                   ui-icons_cd0a0a_256x240.png
    │                   ui-icons_ffffff_256x240.png
    │
    └───js
        │   min.js
        │
        └───vendor
            │   jgestures.js
            │   jquery-1.8.3.min.js
            │   jquery.mousewheel.js
            │   jquery.ui.touch-punch.js
            │   modernizr-2.6.2.min.js
            │
            └───ui
                    jquery-ui-1.10.2.custom.js
                    jquery.hammer.js
                    jquery.specialevent.hammer.js
```

## Anything else?

Well, it's been a fun ride making all of this code (there are nearly 20K lines!), but I want to move on to other games now, so I likely won't be maintaining this much. If you have any questions whatsoever, please ask me at onaimada@gmail.com. Hope you can learn something from the code! :)
