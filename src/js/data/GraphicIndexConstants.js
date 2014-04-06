/*
 * OpHog - https://github.com/Adam13531/OpHog
 * Copyright (C) 2014  Adam Damiano
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */
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
        RIP_TOMBSTONE: 28,
        CRACKED_TOMBSTONE: 29,
        ERODED_TOMBSTONE: 30,
        BONES_1: 31, // a large bone, two skulls, medium coverage on the tile
        BONES_2: 32,
        BONES_3: 33,
        BONES_4: 34,
        BONES_5: 35,
        BONES_6: 36,
        BONES_7: 37,
        FIRE_1: 38, // a large fireball, first frame
        FIRE_2: 39, // a large fireball, second frame
        BIG_GREEN_BUSH: 43, // a green bush covering almost the entire tile
        MEDIUM_GREEN_BUSH: 44, // a green bush covering about 75% of the tile
        BIG_AUTUMN_BUSH: 48,
        MEDIUM_AUTUMN_BUSH: 49,
        TWO_AUTUMN_BUSHES_1: 50,
        TWO_AUTUMN_BUSHES_2: 51,
        SMALL_AUTUMN_BUSH: 52,
        THREE_FLOWERS: 100, // three flowers arranged in a triangle at the outer edge of the tile
        TWO_FLOWERS: 101, // two flowers arranged at NW and SE corners of the tile
        ONE_FLOWER: 102, // one flower in the center of the tile
        FOUR_GREEN_STEPS: 103,
        BIG_GRAY_STONE: 105, // a square stone
        BIG_JUNGLE_PLANT: 106,
        MEDIUM_JUNGLE_PLANT: 107,
        BIG_BLUE_POND: 108, // blue circular pond that covers most of the tile
        SMALL_BLUE_POND: 109, // blue circular pond that covers about half the tile
        GENERATOR: 155, // swirly pink door
        SMALL_GRAY_ROCKS: 161, // three small circular rocks arranged in a triangle
        CACTUS_1: 162, // cactus with no branches
        CACTUS_2: 163, // cactus with branch on the right
        CACTUS_3: 164, // cactus with branch on each side
        CRACKED_BROWN_FOUR_POINT_STONE_1: 196,
        CRACKED_BROWN_FOUR_POINT_STONE_2: 197,
        TREASURE_CHEST: 202, // closed treasure chest, facing left
        BARREL: 209, // fully intact barrel
        GREEN_TREE: 214, // a healthy oak tree
        GREEN_TREE_WITH_FRUIT: 215, // a healthy oak tree with three red fruits
        AUTUMN_TREE: 216,
        DYING_TREE: 217,
        TREE_STUMP: 218,
        EVERGREEN_TREE: 219, // a healthy, large evergreen
        SNOWY_EVERGREEN_TREE: 220, // a healthy, large evergreen with snow on it
        AUTUMN_FOREST_PATCH_1: 274,
        AUTUMN_FOREST_PATCH_2: 275,
        AUTUMN_FOREST_PATCH_3: 276,
        EVERGREEN_FOREST_PATCH_1: 280, // the upper left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_2: 281, // the upper middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_3: 282, // the upper right portion of the evergreen forest
        CAULDRON: 315, // cauldron with purple liquid coming out
        WIZARD_STATUE: 317,
        ARCHER_STATUE: 319,
        WARRIOR_STATUE: 320,
        AUTUMN_FOREST_PATCH_4: 331,
        AUTUMN_FOREST_PATCH_5: 332,
        AUTUMN_FOREST_PATCH_6: 333,
        EVERGREEN_FOREST_PATCH_4: 337, // the middle left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_5: 338, // the middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_6: 339, // the middle right portion of the evergreen forest
        SPAWNER: 371, // concentric cirles (yellow on outside)
        SPAWNER_MEDIUM: 372, // blue spawner
        SPAWNER_HARD: 373, // red spawner
        AUTUMN_FOREST_PATCH_7: 388,
        AUTUMN_FOREST_PATCH_8: 389,
        AUTUMN_FOREST_PATCH_9: 390,
        EVERGREEN_FOREST_PATCH_7: 394, // the lower left portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_8: 395, // the lower middle portion of the evergreen forest
        EVERGREEN_FOREST_PATCH_9: 396, // the lower right portion of the evergreen forest
        TOMBSTONE_PURPLE_GEM: 429,
        TOMBSTONE_TWISTED: 430,
        TOMBSTONE_PURPLE_FACE: 431,
        TOMBSTONE_WITH_LOOP: 432,
        TOMBSTONE_WITH_CROSS: 433,
        TOMBSTONE_RUBBLE: 434,
        AUTUMN_DUO_1: 445,
        AUTUMN_DUO_2: 446,
        AUTUMN_DUO_3: 447,
        EVERGREEN_DUO_1: 451, // the upper left of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_2: 452, // the upper middle of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_3: 453, // the upper right of a 3-wide, 2-tall duo of evergreen trees
        WELL_WITH_BROWN_WATER: 488, // well with brown water in it
        WELL_WITH_WOOD_FRAME: 489,
        BALE_OF_HAY: 490,
        PILE_OF_STONE: 491, // grey pile of stone
        ANIMAL_SKULL: 497, // an animal skull with two horns (one is broken)
        AUTUMN_DUO_4: 502,
        AUTUMN_DUO_5: 503,
        AUTUMN_DUO_6: 504,
        EVERGREEN_DUO_4: 508, // the lower left of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_5: 509, // the lower middle of a 3-wide, 2-tall duo of evergreen trees
        EVERGREEN_DUO_6: 510, // the lower right of a 3-wide, 2-tall duo of evergreen trees
        SNOWY_EVERGREEN_TREE_PATCH_1: 556, // the upper left portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_2: 557, // the upper middle portion of the snowy evergreen forest
        SNOWY_EVERGREEN_TREE_PATCH_3: 558, // the upper right portion of the snowy evergreen forest
        TREASURE_CHEST_WITH_DIAMONDS: 604, // closed treasure chest, facing left
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
        LUSH_GREEN_BRUSH_2: 776,
        AUTUMN_BRUSH: 774,
        SNOWY_EVERGREEN_DUO_4: 784, // the lower left of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_5: 785, // the lower middle of a 3-wide, 2-tall duo of snowy evergreen trees
        SNOWY_EVERGREEN_DUO_6: 786, // the lower right of a 3-wide, 2-tall duo of snowy evergreen trees
        DARK_COBBLESTONE: 801, // many dark stones covering the entire tile
        SKULL_HEDGE_LEFT_END: 865,
        SKULL_HEDGE_MIDDLE_HORIZ: 866,
        SKULL_HEDGE_RIGHT_END: 867,
        SKULL_HEDGE_TOP_END: 868,
        SKULL_HEDGE_MIDDLE_VERT: 869,
        SKULL_HEDGE_BOTTOM_END: 870,
        SKULL_HEDGE_UPPER_RIGHT: 872,
        SKULL_HEDGE_BOTTOM_LEFT: 873,
        SKULL_HEDGE_LEFT_BOTTOM_RIGHT: 876,
        FENCE_MIDDLE_HORIZ_PIECE: 921,
        FENCE_MIDDLE_VERT_PIECE: 926,
        FENCE_LEFT_CORNER: 932,
        FENCE_RIGHT_CORNER: 934,
        LIGHT_GRAY_DOWN_STAIRS: 977,
        PATH_TILE_SAND: 997, // tan tile with specks. This marks the start of one of our "auto tiles".
        PATH_TILE_DIRT: 1111, // brown tile with specks. This marks the start of one of our "auto tiles".
        TAN_STONE_PATH_1: 1140,
        TAN_STONE_PATH_2: 1141,
        TAN_STONE_PATH_3: 1142,
        TAN_STONE_PATH_4: 1143,
        TAN_STONE_PATH_5: 1144,
        TAN_STONE_PATH_6: 1145,
        CRACKED_TAN_BLOCK_HORIZ_RIDGE_1: 1150,
        CRACKED_TAN_BLOCK_HORIZ_RIDGE_2: 1151,
        CRACKED_TAN_BLOCK_HORIZ_RIDGE_3: 1152,
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
        MUD_PATH: 1454,
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
        PATH_TILE_SALT_STREAK: 1681,
        BLUE_WATER_1: 1714, // blue-tinted water graphic, first frame
        RED_WATER_1: 1720, // red-tinted water graphic, first frame
        BLUE_WATER_2: 1771, // blue-tinted water graphic, second frame
        RED_WATER_2: 1777, // red-tinted water graphic, second frame
        PATH_TILE_SALT: 1795,
        BLUE_WATER_EDGE_SMALL_SQUARE_1: 1828, // the top left of a 2-wide, 2-tall square of water only on the edges
        BLUE_WATER_EDGE_SMALL_SQUARE_2: 1829, // the top right of a 2-wide, 2-tall square of water only on the edges
        BLOCK_IN_BLUE_WATER_TOUCHING: 1830, // grey tile that has some blue water touching it
        BLUE_WATER_EDGE_SMALL_SQUARE_3: 1885, // the bottom left of a 2-wide, 2-tall square of water only on the edges
        BLUE_WATER_EDGE_SMALL_SQUARE_4: 1886, // the bottom right of a 2-wide, 2-tall square of water only on the edges
        BLOCK_IN_BLUE_WATER_NOT_TOUCHING: 1887, // grey tile that has some water near it that's not touching it
        PATH_TILE_JUNGLE: 1909,
        PATH_TILE_SNOW_BLUE: 2137, // blue-colored snow tile. This marks the start of one of our "auto tiles".
        SMALL_BROWN_POOL: 2191,

        //----------------------------------------------------------------------
        // Graphics for eff_24.png
        //----------------------------------------------------------------------
        MEDIUM_YELLOW_CIRCLE_1: 2,
        MEDIUM_YELLOW_CIRCLE_2: 3,
        MEDIUM_YELLOW_CIRCLE_3: 4,
        MEDIUM_GRAY_CIRCLE_1: 5,
        MEDIUM_GRAY_CIRCLE_2: 6,
        MEDIUM_GRAY_CIRCLE_3: 7,
        MEDIUM_GRAY_CIRCLE_4: 8,
        MEDIUM_GRAY_CIRCLE_5: 9,
        MEDIUM_BLUE_CIRCLE_1: 12, // a solid blue circular object, part of an explosion sequence
        MEDIUM_BLUE_CIRCLE_2: 13,
        MEDIUM_BLUE_CIRCLE_3: 14,
        MEDIUM_BLUE_CIRCLE_4: 15,
        MEDIUM_PURPLE_CIRCLE_1: 16,
        MEDIUM_PURPLE_CIRCLE_2: 17,
        MEDIUM_PURPLE_CIRCLE_3: 18,
        MEDIUM_PURPLE_CIRCLE_4: 19,
        MEDIUM_BLACK_CIRCLE_1: 22,
        MEDIUM_BLACK_CIRCLE_2: 23,
        MEDIUM_BLACK_CIRCLE_3: 24,
        MEDIUM_BLACK_CIRCLE_4: 25,
        MEDIUM_GREEN_CIRCLE_1: 26,
        MEDIUM_GREEN_CIRCLE_2: 27,
        MEDIUM_GREEN_CIRCLE_3: 28,
        MEDIUM_GREEN_CIRCLE_4: 29,
        HORIZONTAL_NEEDLE: 43, // a white, thin sliver extending from left to right
        RED_EXCLAMATION_POINT: 44, // a red '!' that's transparent in the middle
        SMALL_PURPLE_BUBBLE: 46, // a tiny purple bubble that is transparent in the middle
        SMALL_YELLOW_STAR: 70, // a yellow diamond, turned on its side
        RED_FIREBALL_RIGHT: 110, // an orange/red fireball facing right

        //----------------------------------------------------------------------
        // Graphics for eff_32.png
        //----------------------------------------------------------------------
        BLUE_SMOKE_CLOUD_1: 14,
        BLUE_SMOKE_CLOUD_2: 15,

        //----------------------------------------------------------------------
        // Graphics for char_24.png. All indices specify the first frame in the
        // two-frame animation.
        // 
        // The names for the keys should match create_key.doc (which Oryx
        // provided) as much as possible. You can use a file called
        // reversed_creature_key.txt that Adam made because it might be easier.
        // He reversed the order of the creature names that Oryx provided.
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
        KNIGHT_ALT_1: 40, // knight with a grey helm, shield with blue circle on it, and a spear
        GUARD_ALT_F_1: 41, // white chick with a grey helmet, red hair, lipstick, blue cape, and a spear
        GUARD_ALT_M_1: 42, // white dude with with a grey helmet, blue cape, and a spear
        KNIGHT_1: 43, // knight with grey helm, shield with black hole in the center, and a spear
        GUARD_F_1: 44, // white chick with a grey helmet, lipstick, red cape, and a spear
        GUARD_M_1: 45, // white dude with a grey helmet, red cape, and a spear
        PRINCESS_1: 46,
        PRINCE_1: 47,
        QUEEN_1: 48,
        KING_1: 49, // an old man with a crown and staff and blue capes
        BISHOP: 50,
        CHEF: 51,
        BUTCHER: 52,
        MERCHANT_1: 53,
        HUMAN_F_1: 54,
        HUMAN_M_1: 55,
        HOODED_HUMAN_1: 56,
        BANDIT_1: 57,
        KNIGHT_ALT_2: 80,
        GUARD_ALT_F_2: 81,
        GUARD_ALT_M_2: 82,
        KNIGHT_2: 83,
        GUARD_F_2: 84,
        GUARD_M_2: 85,
        PRINCESS_2: 86,
        PRINCE_2: 87,
        QUEEN_2: 88,
        KING_2: 89,
        PROPHET: 90,
        ALCHEMIST: 91,
        SLAVE: 92,
        MERCHANT_2: 93,
        HUMAN_F_2: 94,
        HUMAN_M_2: 95,
        HOODED_HUMAN_2: 96,
        BANDIT_2: 97,
        HIGH_ELF_MAGE_F: 120,
        HIGH_ELF_RANGER_F: 121, // an elf with light gray skin, white hair, green cape, and bow
        HIGH_ELF_SHIELD_FIGHTER_F: 122,
        HIGH_ELF_FIGHTER_F: 123,
        HIGH_ELF_MAGE_M: 124,
        HIGH_ELF_RANGER_M: 125,
        HIGH_ELF_SHIELD_FIGHTER_M: 126,
        HIGH_ELF_FIGHTER_M: 127,
        DROW_SORCERESS: 128,
        DROW_MAGE: 129,
        DROW_RANGER: 130, // a blue-skinned creature with white hair, a purple shirt, and a red cape
        DROW_FIGHTER: 131,
        DROW_ASSASSIN: 132,
        DWARF_PRIEST: 133,
        DWARF_ALT: 134,
        DWARF: 135,
        BANDIT_3: 136,
        ASSASSIN: 137,

        GNOME_WIZARD_ALT: 160,
        GNOME_WIZARD: 161,
        GNOME_FIGHTER_ALT_1: 162,
        GNOME_FIGHTER_ALT_2: 163,
        GNOME_FIGHTER: 164,
        LIZARDMAN_HIGH_SHAMAN: 165,
        LIZARDMAN_SHAMAN: 166,
        LIZARDMAN_CAPTAIN: 167,
        LIZARDMAN_ARCHER: 168,
        LIZARDMAN_WARRIOR: 169,
        WOOD_ELF_DRUID_F: 170,
        WOOD_ELF_RANGER_F: 171, // a gray-skinned creature with lipstick, brown hair, a gray shirt, and a gray/orange cape
        WOOD_ELF_SHIELD_FIGHTER_F: 172,
        WOOD_ELF_FIGHTER_F: 173,
        WOOD_ELF_DRUID_M: 174,
        WOOD_ELF_RANGER_M: 175,
        WOOD_ELF_SHIELD_FIGHTER_M: 176,
        WOOD_ELF_FIGHTER_M: 177,

        MIMIC: 200,
        TREANT: 201,  // a brown tree with no leaves and an unhappy face
        DJINN: 202,
        BONE_GOLEM: 203,
        LAVA_GOLEM: 204,
        FLESH_GOLEM: 205,
        MUD_GOLEM: 206,
        STONE_GOLEM: 207,
        HORNED_DEMON: 208,
        FIRE_DEMON: 209,
        ELDER_DEMON: 210,
        MINOTAUR_ALT: 211,
        MINOTAUR_CLUB: 212,
        MINOTAUR_AXE: 213,
        GNOLL_SHAMAN: 214,
        GNOLL_FIGHTER_CAPTAIN: 215,
        GNOLL_FIGHTER_ALT: 216,
        GNOLL_FIGHTER: 217,

        CROW_RAVEN: 240,
        BLUE_BIRD: 241,
        DOVE_PIGEON: 242,
        BLACK_WOLF: 243, // a dark grey wolf with red eyes
        BROWN_WOLF: 244,
        GREY_WOLF: 245,
        FIRE_BEETLE: 246,
        BEETLE: 247,
        COBRA: 248, // a green cobra with red eyes
        BROWN_RAT: 249,
        GREY_RAT: 250,
        BLACK_SPIDER: 251, // a black spider with a red marking on it
        RED_SPIDER: 252,
        BEHOLDER: 253,
        RED_BAT: 254,
        BLACK_BAT: 255,
        GREEN_SLIME: 256,
        PURPLE_SLIME: 257,

        AIR_ELEMENTAL: 280,
        ICE_WATER_ELEMENTAL: 281, // blue elemental with arms raised up
        EARTH_ELEMENTAL: 282,
        DEATH_KNIGHT_ALT_1: 283,
        DEATH_KNIGHT_ALT_2: 284,
        DEATH_KNIGHT: 285,
        CYCLOPS_ALT: 286,
        CYCOPS: 287,
        TROLL_CAPTAIN: 288,
        TROLL: 289,
        ORC_MYSTIC: 290,
        ORC_CAPTAIN: 291,
        ORC_FIGHTER: 292, // a gray orc with a red cape and a dagger
        GOBLIN_MYSTIC: 293,
        GOBLIN_KING: 294,
        GOBLIN_CAPTAIN: 295,
        GOBLIN_ARCHER: 296,
        GOBLIN_FIGHTER: 297,

        GREEN_WITCH: 320,
        FROST_WITCH: 321,
        WITCH: 322,
        VAMPIRE_LORD: 323,
        VAMPIRE_ALT: 324,
        VAMPIRE: 325,
        DEATH: 326,
        DARK_WIZARD: 327,
        NECROMANCER: 328,
        PHAROAH: 329,
        MUMMY: 330,
        GHOST: 331,
        SHADOW: 332,
        SKELETON_WARRIOR: 333,
        SKELETON_ARCHER: 334,
        SKELETON: 335,
        HEADLESS_ZOMBIE: 336,
        ZOMBIE: 337,

        IMP_DEMON_DEVIL: 360,
        PIXIE_FAIRY_SPRITE: 361,
        ETTIN_ALT: 362,
        ETTIN: 363,
        GIANT_BLACK_SCORPION: 364, // a black scorpion with yellow eyes
        SCORPION_ALT: 365,
        GIANT_SCORPION: 366,
        POLAR_BEAR: 367,
        GREY_BEAR: 368,
        BROWN_BEAR: 369,
        GIANT_WORM: 370,
        GIANT_LEECH: 371,
        YETI_ALT: 372,
        YETI: 373, // white yeti
        GREEN_DRAGON: 374, // a green dragon with a small wing
        GOLD_DRAGON: 375,
        PURPLE_DRAGON: 376,
        RED_DRAGON: 377,

        COLD_FLAME: 400,
        FLAME: 401,
        RED_JELLY: 402,
        GREEN_JELLY: 403,
        BLUE_JELLY: 404,
        BROWN_SPECTER: 405,
        BLUE_SPECTER: 406,
        RED_SPECTER: 407,
        EYES: 408,
        EYE: 409,
        MUD_MINION: 410,
        SMOKE_MINION: 411,
        ICE_MINION: 412,
        FIRE_MINION: 413,
        ROTTEN_TURNIP: 414,
        TURNIP: 415,
        WISP_ALT: 416,
        WISP: 417,

        BIG_SHADOW_LOW: 452, // a shadow that takes up the whole bottom of a tile
        MED_SHADOW_LOW: 453, // a shadow that takes up most of the bottom of a tile
        SMALL_SHADOW_LOW: 454, // a shadow that takes up some of the bottom of a tile
        BIG_SHADOW_FLOAT: 455, // BIG_SHADOW_LOW but it's floating off the ground by a bit
        MED_SHADOW_FLOAT: 456, // MED_SHADOW_LOW but it's floating off the ground by a bit
        SMALL_SHADOW_FLOAT: 457, // SMALL_SHADOW_LOW but it's floating off the ground by a bit

        //----------------------------------------------------------------------
        // Graphics for item_32.png
        //----------------------------------------------------------------------
        SMALL_BLUE_POTION: 0,
        SMALL_PURPLE_POTION: 1,
        SMALL_RED_POTION: 2,
        SMALL_GREEN_POTION: 3,
        SMALL_YELLOW_POTION: 4,
        SMALL_WHITE_POTION: 5,
        MEDIUM_BLUE_POTION: 6,
        MEDIUM_PURPLE_POTION: 7,
        MEDIUM_RED_POTION: 8,
        MEDIUM_GREEN_POTION: 9,
        MEDIUM_YELLOW_POTION: 10,
        MEDIUM_WHITE_POTION: 11,
        LARGE_BLUE_POTION: 12,
        LARGE_PURPLE_POTION: 13,
        LARGE_RED_POTION: 14,
        LARGE_GREEN_POTION: 15,
        LARGE_YELLOW_POTION: 16,
        LARGE_WHITE_POTION: 17,
        BROWN_URN: 18,
        GRAY_URN: 19,
        YELLOW_URN: 20,
        PURPLE_URN: 21,
        HEART_NECKLACE: 24,
        ROCK_NECKLACE: 25,
        SAPPHIRE_NECKLACE: 26,
        RUBY_NECKLACE: 27,
        GOLD_EYE_NECKLACE: 28,
        SKULL_NECKLACE: 29,
        GRAY_ROCK: 30,
        GREEN_ROCK: 31,
        YELLOW_ROCK: 32,
        BLUE_ROCK: 33,
        RED_ROCK: 34,
        WHITE_ROCK: 35,
        PURPLE_ROCK: 36,
        SMALL_BLACK_POTION: 37,
        MEDIUM_BLACK_POTION: 38,
        LARGE_BLACK_POTION: 39,
        RED_SCALE: 40,
        PURPLE_SCALE: 41,
        GREEN_SCALE: 42,
        YELLOW_SCALE: 43,
        BLUE_SCALE: 44,
        WHITE_SCALE: 45,
        WHITE_NOTE: 48,
        LIGHT_BROWN_NOTE: 49,
        DARK_BROWN_NOTE: 50,
        YELLOW_NOTE: 51,
        MANILLA_NOTE: 52,
        PLAIN_ROD: 53,
        GREEN_ROD: 54,
        RED_ROD: 55,
        BLACK_ROD: 56,
        BLUE_ROD: 57,
        GREEN_DIAMOND: 58,
        CYAN_DIAMOND: 59,
        RED_DIAMOND: 60,
        YELLOW_DIAMOND: 61,
        GREEN_BROOCH_GEM: 62,
        GREEN_BROOCH: 63,
        PURPLE_BROOCH_GEM: 64,
        PURPLE_BROOCH: 65,
        RED_BROOCH_GEM: 66,
        RED_BROOCH: 67,
        BLUE_BROOCH_GEM: 68,
        BLUE_BROOCH: 69,
        BROWN_BOOK: 72,
        BLACK_BOOK: 73,
        TORN_BOOK: 74,
        PURPLE_BOOK: 75,
        GREEN_BOOK: 76,
        BROWN_BAG: 77,
        COPPER_COINS: 78,
        SILVER_COINS: 79,
        GOLD_COINS: 80,
        PLAIN_SILVER_RING: 81,
        PLAIN_GOLD_RING: 82,
        RUBY_RING: 83,
        ORANGE_RING: 84,
        DIAMOND_RING: 85,
        AMETHYST_RING: 86,
        SAPPHIRE_RING: 87,
        EMERALD_RING: 88,
        SKULL_RING: 89,
        FULL_HEART: 90,
        HALF_HEART: 91,
        EMPTY_HEART: 92,
        BROKEN_HEART: 93,
        BLUE_BALL: 96,
        GREEN_BALL: 97,
        RED_BALL: 98,
        PURPLE_BALL: 99,
        YELLOW_BALL: 100,
        RED_MUSHROOM: 101,
        BLUE_MUSHROOM: 102,
        WHITE_FEATHER: 103,
        RED_FEATHER: 104,
        BONE_PILE: 105,
        EYE_ITEM: 106,
        SILVER_BADGE: 107,
        GOLD_BADGE: 108,
        EXPLODING_BADGE: 109,
        SMALL_GREEN_BROOCH_GEM: 110,
        SMALL_GREEN_BROOCH: 111,
        SMALL_YELLOW_SQUARE_ITEM: 112,
        LARGE_YELLOW_SQUARE_ITEM: 113,
        LARGE_DOUBLE_YELLOW_SQUARE_ITEM: 114,
        SMALL_GRAY_SQUARE_ITEM: 115,
        LARGE_GRAY_SQUARE_ITEM: 116,
        LARGE_DOUBLE_GRAY_SQUARE_ITEM: 117,
        //WEIRD GREEN ITEMS MISSING
        BIG_RED_GEM: 136,
        BIG_YELLOW_GEM: 137,
        BIG_GREEN_GEM: 138,
        BIG_CYAN_GEM: 139,
        BIG_BLUE_GEM: 140,
        BIG_PURPLE_GEM: 141,
        SKULL: 144,
        SKULL_RED_EYES: 145,
        YELLOW_SKULL: 146,
        SCROLL: 147,
        PAPER_WITH_WRITING: 148,
        GOLD_KEY: 149,
        GRAY_KEY: 150,
        WHITE_KEY: 151,
        GOLD_KEY: 152,
        ICE_KEY: 153,
        FIRE_KEY: 154,
        CLOCK: 155,
        LIT_CANDLE: 156,
        CANDLE: 157,
        LANTERN: 158,
        LIT_LANTERN: 159,
        CROWN: 160,
        CROWN_ONE_POINT: 161,
        CRACKED_BELL: 162,
        STICK: 163,
        FIERY_STICK: 164,
        ICY_STICK: 165,
        WHITE_QUIVER: 168,
        RED_QUIVER: 169,
        YELLOW_QUIVER: 170,
        GREEN_QUIVER: 171,
        WOODEN_MACE: 172,
        STEEL_MACE: 173,
        WOODEN_FLAIL: 174,
        YELLOW_FLAIL: 175,
        BLUE_FLAIL: 176,
        SILVER_HAMMER: 177,
        DOUBLE_EDGE_HAMMER: 178,
        YELLOW_HAMMER: 179,
        SMALL_WOODEN_AXE: 180,
        MEDIUM_WOODEN_AXE: 181,
        LARGE_WOODEN_AXE: 182,
        LARGE_RED_AXE: 183,
        LARGE_YELLOW_AXE: 184,
        LARGE_ICE_AXE: 185,
        LARGE_FIRE_AXE: 186,
        // MISSING SLOT FOR DUPLICATED AXE
        LARGE_DOUBLE_EDGED_AXE: 188,
        MEDIUM_ICE_AXE: 189,
        WOOD_STAFF_1: 192,
        WOOD_STAFF_2: 193,
        WOOD_STAFF_3: 194,
        WOOD_STAFF_4: 195,
        FIRE_STAFF: 196,
        WOOD_STAFF_5: 197,
        WOOD_CROSS_STAFF: 198,
        YELLOW_CROSS_STAFF: 199,
        PURPLE_TIPPED_STAFF: 200,
        RED_TIPPED_STAFF: 201,
        BLUE_TIPPED_STAFF: 202,
        BLUE_STAFF: 203,
        GREEN_STAFF: 204,
        WHITE_STAFF: 205,
        WOODEN_BOW: 206,
        WOODEN_REINFORCED_BOW: 207,
        STEEL_REINFORCED_BOW: 208,
        BLUE_BOW: 209,
        YELLOW_BOW: 210,
        WOODEN_CROSSBOW: 211,
        STEEL_CROSSBOW: 212,
        YELLOW_CROSSBOW: 213,
        DAGGER_1: 216,
        DAGGER_2: 217,
        YELLOW_DAGGER: 218,
        BUTCHER_KNIFE: 219,
        WHITE_KNIFE: 220,
        ICE_KNIFE: 221,
        FIRE_KNIFE: 222,
        BIG_KNIFE: 223,
        SABRE: 224,
        GREEN_SABRE: 225,
        THIN_SWORD: 226,
        SWORD: 227,
        GOLD_HANDLE_SWORD: 228,
        GOLD_SWORD: 229,
        ICE_SWORD: 230,
        FIRE_SWORD: 231,
        STEEL_SWORD: 232,
        BLOOD_SWORD: 233,
        RED_HANDLE_SWORD: 234,
        WHITE_HANDLE_SWORD: 235,
        FALCHION: 236,
        BLACK_SWORD: 237,
        WOOD_BUCKLER_1: 240,
        WOOD_BUCKLER_2: 241,
        STEEL_BUCKLER_1: 242,
        STEEL_BUCKLER_2: 243,
        WOOD_DIAMOND_SHIELD: 244,
        STEEL_DIAMOND_SHIELD: 245,
        YELLOW_DIAMOND_SHIELD: 246,
        RED_WHITE_SHIELD: 247,
        BLUE_WHITE_SHIELD: 248,
        RED_SHIELD: 249,
        GREEN_WHITE_SHIELD: 250,
        RED_YELLOW_SHIELD: 251,
        RED_SKULL_SHIELD: 252,
        CRACKED_SHIELD: 253,
        BROWN_BELT: 254,
        BROWN_BELT_WITH_BUCKLE: 255,
        BROWN_STUDDED_BELT: 256,
        GRAY_BELT: 257,
        YELLOW_BELT: 258,
        RED_BELT: 259,
        BLUE_BELT: 260,
        BLACK_BELT: 261,
        BROWN_CAPE: 264,
        BLUE_CAPE: 265,
        GREEN_CAPE: 266,
        RED_CAPE: 267,
        WHITE_CAPE: 268,
        BLACK_CAPE: 269,
        YELLOW_CAPE: 270,
        BROWN_CLOAK_1: 271,
        BLUE_CLOAK: 272,
        GREEN_CLOAK: 273,
        YELLOW_CLOAK: 274,
        RED_CLOAK: 275,
        BROWN_CLOAK_2: 276,
        PURPLE_CLOAK: 277,
        BLACK_CLOAK: 278,
        BROWN_GLOVES: 279,
        GRAY_GLOVES: 280,
        BROWN_GRAY_GLOVES: 281,
        YELLOW_GLOVES: 282,
        RED_GLOVES: 283,
        BLUE_GLOVES: 284,
        BLACK_GLOVES: 285,
        BROWN_ARMOR: 288,
        GRAY_ARMOR: 289,
        GREEN_ARMOR: 290,
        YELLOW_ARMOR_1: 291,
        YELLOW_ARMOR_2: 292,
        RED_ARMOR: 293,
        BLUE_ARMOR: 294,
        PURPLE_ARMOR: 295,
        BLACK_ARMOR: 296,
        MAROON_ARMOR: 297,
        WOOD_HELM: 298,
        STEEL_HELM: 299,
        WOOD_STEEL_HELM: 300,
        HELM_WITH_RED: 301,
        FULL_HELM: 302,
        YELLOW_HELM: 303,
        RED_HELM: 304,
        BLUE_HELM: 305,
        BLACK_WITCH_HAT: 306,
        BLUE_WITCH_HAT: 307,
        RED_WITCH_HAT: 308,
        GREEN_WITCH_HAT: 309,
        BROWN_BOOT_1: 312,
        BROWN_BOOT_2: 313,
        GREEN_BOOT: 314,
        BLUE_BOOT: 315,
        BROWN_BOOT_3: 316,
        GRAY_BOOT_1: 317,
        GRAY_BOOT_2: 318,
        RED_BOOT: 319,
        CYAN_BOOT: 320,
        BROWN_BOOT_4: 321,
        BLACK_BOOT: 322,
        BROWN_PANTS_1: 323,
        GREEN_PANTS_1: 324,
        BROWN_PANTS_2: 325,
        GRAY_PANTS_1: 326,
        GRAY_PANTS_2: 327,
        YELLOW_PANTS: 328,
        RED_PANTS: 329,
        BLUE_PANTS_1: 330,
        BLACK_PANTS: 331,
        BLUE_PANTS_2: 332,
        GREEN_PANTS_2: 333,
        //----------------------------------------------------------------------
        // Graphics for icon_16.png
        //----------------------------------------------------------------------
        BLUE_DIAMOND: 0,
        GOLD_COIN: 1,
    };
}());