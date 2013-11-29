/**
 * This file exists solely to define graphic index constants.
 *
 * ADVISORY WHEN ADDING: try to keep the indices sorted, and try to include a
 * description that the tag (e.g. "GENERATOR") won't necessarily tell you (eg.
 * "swirly pink door").
 *     Addendum (11/28/13): no need to add descriptive comments anymore.
 *     Normally, I'd overwrite the old comment, but I wanted it to be clear why 
 *     some have comments and some don't.
 */
( function() {
    window.game.Graphic = {
        //----------------------------------------------------------------------
        // Graphics for env_24.png
        //----------------------------------------------------------------------
        BONES: 31, // a large bone, two skulls, medium coverage on the tile
        FIRE_1: 38, // a large fireball, first frame
        FIRE_2: 39, // a large fireball, second frame
        BIG_GREEN_BUSH: 43, // a green bush covering almost the entire tile
        MEDIUM_GREEN_BUSH: 44, // a green bush covering about 75% of the tile
        THREE_FLOWERS: 100, // three flowers arranged in a triangle at the outer edge of the tile
        TWO_FLOWERS: 101, // two flowers arranged at NW and SE corners of the tile
        ONE_FLOWER: 102, // one flower in the center of the tile
        BIG_GRAY_STONE: 105, // a square stone
        BIG_BLUE_POND: 108, // blue circular pond that covers most of the tile
        SMALL_BLUE_POND: 109, // blue circular pond that covers about half the tile
        GENERATOR: 155, // swirly pink door
        SMALL_GRAY_ROCKS: 161, // three small circular rocks arranged in a triangle
        CACTUS_1: 162, // cactus with no branches
        CACTUS_2: 163, // cactus with branch on the right
        CACTUS_3: 164, // cactus with branch on each side
        TREASURE_CHEST: 202, // closed treasure chest, facing left
        BARREL: 209, // fully intact barrel
        GREEN_TREE: 214, // a healthy oak tree
        GREEN_TREE_WITH_FRUIT: 215, // a healthy oak tree with three red fruits
        EVERGREEN_TREE: 219, // a healthy, large evergreen
        SNOWY_EVERGREEN_TREE: 220, // a healthy, large evergreen with snow on it
        EVERGREEN_FOREST_PATCH_1: 280, // the upper left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_2: 281, // the upper middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_3: 282, // the upper right portion of the evergreen forest
        CAULDRON: 315, // cauldron with purple liquid coming out
        EVERGREEN_FOREST_PATCH_4: 337, // the middle left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_5: 338, // the middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_6: 339, // the middle right portion of the evergreen forest
        SPAWNER: 371, // concentric cirles (yellow on outside)
        EVERGREEN_FOREST_PATCH_7: 394, // the lower left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_8: 395, // the lower middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_9: 396, // the lower right portion of the evergreen forest
        EVERGREEN_DUO_1: 451, // the upper left of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_2: 452, // the upper middle of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_3: 453, // the upper right of a 3-wide, 2-tall duo of evergreen trees
        WELL_WITH_BROWN_WATER: 488, // well with brown water in it
        PILE_OF_STONE: 491, // grey pile of stone
        ANIMAL_SKULL: 497, // an animal skull with two horns (one is broken)
        EVERGREEN_DUO_4: 508, // the lower left of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_5: 509, // the lower middle of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_6: 510, // the lower right of a 3-wide, 2-tall duo of evergreen trees
        SNOWY_EVERGREEN_TREE_PATCH_1: 556, // the upper left portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_2: 557, // the upper middle portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_3: 558, // the upper right portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_4: 613, // the middle left portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_5: 614, // the middle portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_6: 615, // the middle right portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_7: 670, // the bottom left portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_8: 671, // the bottom middle portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_9: 672, // the bottom right portion of the snowy evergreen forest
        DESERT_SAND: 713, // small dark beige streaks on a solid beige tile
        DIRT_PATH: 715, // small dark brown streaks on a solid brown tile
        SNOW_BANK: 718, // light grey-colored tile with white spots
        SNOWY_EVERGREEN_DUO_1: 727, // the upper left of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_2: 728, // the upper middle of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_3: 729, // the upper right of a 3-wide, 2-tall duo of snowy evergreen trees
        LIGHT_GREEN_BRUSH: 769, // light green flowers/grass/greenery
        LUSH_GREEN_BRUSH: 773, // bright green flowers/grass/greenery     
        SNOWY_EVERGREEN_DUO_4: 784, // the lower left of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_5: 785, // the lower middle of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_6: 786, // the lower right of a 3-wide, 2-tall duo of snowy evergreen trees
        DARK_COBBLESTONE: 801, // many dark stones covering the entire tile
        PATH_TILE_SAND: 997, // tan tile with specks. This marks the start of one of our "auto tiles".
        PATH_TILE_DIRT: 1111, // brown tile with specks. This marks the start of one of our "auto tiles".
        RED_STONE_PATH_1: 1254, // stones at the NE, SE, and SW corners
        RED_STONE_PATH_2: 1255, // big stone at bottom, stones at NW and NE
        RED_STONE_PATH_3: 1256, // stones at all four corners
        RED_STONE_PATH_4: 1257, // big stone at top, small stones on bottom
        RED_STONE_PATH_5: 1258, // big stones in NE SE SW, small stones in NW
        RED_STONE_PATH_6: 1259, // 180° rotation of RED_STONE_PATH_5
        CRACKED_RED_BLOCK: 1263, // a cracked red stoney block. There's a gap at the upper left.
        CRACKED_RED_BLOCK_HORIZ_RIDGE_1: 1264, // the left edge of a 3-block ridge
        CRACKED_RED_BLOCK_HORIZ_RIDGE_2: 1265, // the middle part of a 3-block ridge
        CRACKED_RED_BLOCK_HORIZ_RIDGE_3: 1266, // the right edge of a 3-block ridge
        PATH_TILE_DARK_DIRT: 1339, // dark brown tile with specks. This marks the start of one of our "auto tiles".
        DARK_MUD_PATH_FULL_TEXTURE: 1340, // dark mud path, takes up full tile, has some bubbles in it
        PATH_TILE_MUD: 1453, // mud-colored tile with specks. This marks the start of one of our "auto tiles".
        BLUE_WATER_EDGE_LARGE_SQUARE_1: 1543, // the top left of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_2: 1544, // the top middle of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_3: 1545, // the top right of a 3-wide, 3-tall square of water only on the edges
        PATH_TILE_SNOW: 1567, // white-colored tile. This marks the start of one of our "auto tiles".
        BLUE_WATER_EDGE_LARGE_SQUARE_4: 1600, // the middle left of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_5: 1601, // the middle of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_6: 1602, // the middle right of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_7: 1657, // the bottom left of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_8: 1658, // the bottom middle of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_EDGE_LARGE_SQUARE_9: 1659, // the bottom right of a 3-wide, 3-tall square of water only on the edges
        BLUE_WATER_1: 1714, // blue-tinted water graphic, first frame
        RED_WATER_1: 1720, // red-tinted water graphic, first frame
        BLUE_WATER_2: 1771, // blue-tinted water graphic, second frame
        RED_WATER_2: 1777, // red-tinted water graphic, second frame
        BLUE_WATER_EDGE_SMALL_SQUARE_1: 1828, // the top left of a 2-wide, 2-tall square of water only on the edges
        BLUE_WATER_EDGE_SMALL_SQUARE_2: 1829, // the top right of a 2-wide, 2-tall square of water only on the edges
        BLOCK_IN_BLUE_WATER_TOUCHING: 1830, // grey tile that has some blue water touching it
        BLUE_WATER_EDGE_SMALL_SQUARE_3: 1885, // the bottom left of a 2-wide, 2-tall square of water only on the edges
        BLUE_WATER_EDGE_SMALL_SQUARE_4: 1886, // the bottom right of a 2-wide, 2-tall square of water only on the edges
        BLOCK_IN_BLUE_WATER_NOT_TOUCHING: 1887, // grey tile that has some water near it that's not touching it
        PATH_TILE_SNOW_BLUE: 2137, // blue-colored snow tile. This marks the start of one of our "auto tiles".

        //----------------------------------------------------------------------
        // Graphics for eff_24.png
        //----------------------------------------------------------------------
        MEDIUM_BLUE_CIRCLE: 12, // a solid blue circular object, part of an explosion sequence
        HORIZONTAL_NEEDLE: 43, // a white, thin sliver extending from left to right
        RED_EXCLAMATION_POINT: 44, // a red '!' that's transparent in the middle
        SMALL_PURPLE_BUBBLE: 46, // a tiny purple bubble that is transparent in the middle
        SMALL_YELLOW_STAR: 70, // a yellow diamond, turned on its side
        RED_FIREBALL_RIGHT: 110, // an orange/red fireball facing right

        //----------------------------------------------------------------------
        // Graphics for char_24.png. All indices specify the first frame in the
        // two-frame animation.
        // 
        // The names for the keys should match create_key.doc (which Oryx
        // provided) as much as possible.
        // 
        //----------------------------------------------------------------------
        PALADIN_F: 0, // white chick with a red-cross shield, yellow armor, and a mace
        SWORDSMAN_F: 1, // black chick with a sword, pink shirt, yellow earing, and grey cape
        BESERKER_F: 2, // white chick with an axe, red hat with grey horns, blonde hair, and brown vest
        SHAMAN_F: 3, // wizard with gray robes and wolf hat, a staff, and red face paint
        PRIEST_F: 4, // maroon robes and big hat, staff, blonde hair
        WIZARD_F: 5, // no visible face, staff, purple cloak
        RANGER_F: 6, // RANGER_M but with lipstick and an orange cape
        THIEF_F: 7, // white chick with lipstick, green cape, red feather, and a knife
        KNIGHT_F: 8, // a white chick with lipstick, a round shield, a shortsword, and red armor
        PALADIN_M: 9, // a white dude with a blue-cross shield, yellow armor, and a mace
        SWORDSMAN_M: 10, // black dude with a sword, blue shirt, and grey shirt
        BERSERKER_M: 11, // a white dude with a vikin hat, brown shirt/cape, an a hatchet
        SHAMAN_M: 12, // wizard with brown robes and wolf hat, a staff, and blue face paint
        PRIEST_M: 13, // white dude with a golden staff, white robe with a cross on the front of the hood
        WIZARD_M: 14, // wizard with no visible face, a red cape, and a staff
        RANGER_M: 15, // an archer with a bow, a quiver, and a gray cape with feathers
        THIEF_M: 16, // white dude with a green cape, red feather, and a knife
        KNIGHT_M: 17, // a warrior with blue armor, a shield, helmet, and sword
        KNIGHT_ALT_1: 40, // knight with a grey full face helmet, shield with blue circle on it, and a spear
        GUARD_ALT_F_1: 41, // white chick with a grey helmet, red hair, lipstick, blue cape, and a spear
        GUARD_ALT_M_1: 42, // white dude with with a grey helmet, blue cape, and a spear
        KNIGHT_1: 43, // knight with grey full face helmet, shield with black hole in the center, and a spear
        KING: 49, // an old man with a crown and staff and blue capes
        HIGH_ELF_RANGER_F: 121, // an elf with light gray skin, white hair, green cape, and bow
        DROW_RANGER: 130, // a blue-skinned creature with white hair, a purple shirt, and a red cape
        WOOF_ELF_RANGER_F: 171, // a gray-skinned creature with lipstick, brown hair, a gray shirt, and a gray/orange cape
        TREANT: 201, // a brown tree with no leaves and an unhappy face
        BLACK_WOLF: 243, // a dark grey wolf with red eyes
        COBRA: 248, // a green cobra with red eyes
        BLACK_SPIDER: 251, // a black spider with a red marking on it
        ICE_WATER_ELEMENTAL: 281, // blue elemental with arms raised up
        ORC_FIGHTER: 292, // a gray orc with a red cape and a dagger
        GIANT_BLACK_SCORPION: 364, // a black scorpion with yellow eyes
        YETI: 373, // white yeti
        GREEN_DRAGON: 374, // a green dragon with a small wing
        BIG_SHADOW_LOW: 452, // a shadow that takes up the whole bottom of a tile
        MED_SHADOW_LOW: 453, // a shadow that takes up most of the bottom of a tile
        SMALL_SHADOW_LOW: 454, // a shadow that takes up some of the bottom of a tile
        BIG_SHADOW_FLOAT: 455, // BIG_SHADOW_LOW but it's floating off the ground by a bit
        MED_SHADOW_FLOAT: 456, // MED_SHADOW_LOW but it's floating off the ground by a bit
        SMALL_SHADOW_FLOAT: 457, // SMALL_SHADOW_LOW but it's floating off the ground by a bit

        //----------------------------------------------------------------------
        // Graphics for item_32.png
        //----------------------------------------------------------------------
        THIN_RED_POTION: 2,
        FAT_YELLOW_POTION: 10,
        GOLD_EYE_NECKLACE: 28,
        GREEN_GEM: 58,
        CYAN_GEM: 59,
        RED_GEM: 60,
        SMALL_YELLOW_SQUARE_ITEM: 112,
        LARGE_YELLOW_SQUARE_ITEM: 113,
        GRAY_SWORD: 227,
        RED_WHITE_SHIELD: 247,
    };
}());