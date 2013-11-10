/**
 * This file exists solely to define graphic index constants.
 *
 * ADVISORY WHEN ADDING: try to keep the indices sorted, and try to include a
 * description that the tag (e.g. "GENERATOR") won't necessarily tell you (eg.
 * "swirly pink door").
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
        CAULDRON: 315, // cauldron with purple liquid coming out
        SPAWNER: 371, // concentric cirles (yellow on outside)
        ANIMAL_SKULL: 497, // an animal skull with two horns (one is broken)
        DESERT_SAND: 713, // small dark beige streaks on a solid beige tile
        DIRT_PATH: 715, // small dark brown streaks on a solid brown tile
        LIGHT_GREEN_BRUSH: 769, // light green flowers/grass/greenery
        DARK_COBBLESTONE: 801, // many dark stones covering the entire tile
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
        DARK_MUD_PATH_FULL_TEXTURE: 1340, // dark mud path, takes up full tile, has some bubbles in it
        BLUE_WATER_1: 1714, // blue-tinted water graphic, first frame
        RED_WATER_1: 1720, // red-tinted water graphic, first frame
        BLUE_WATER_2: 1771, // blue-tinted water graphic, second frame
        RED_WATER_2: 1777, // red-tinted water graphic, second frame
    };
}());