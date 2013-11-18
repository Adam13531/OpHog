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
        SHAMAN_F: 3, // wizard with gray robes and wolf hat, a staff, and red face paint
        PRIEST_F: 4, // maroon robes and big hat, staff, blonde hair
        WIZARD_F: 5, // no visible face, staff, purple cloak
        RANGER_F: 6, // RANGER_M but with lipstick and an orange cape
        KNIGHT_F: 8, // a white chick with lipstick, a round shield, a shortsword, and red armor
        PALADIN_M: 9, // a white dude with a blue-cross shield, yellow armor, and a mace
        BERSERKER_M: 11, // a white dude with a vikin hat, brown shirt/cape, an a hatchet
        SHAMAN_M: 12, // wizard with brown robes and wolf hat, a staff, and blue face paint
        WIZARD_M: 14, // wizard with no visible face, a red cape, and a staff
        RANGER_M: 15, // an archer with a bow, a quiver, and a gray cape with feathers
        KNIGHT_M: 17, // a warrior with blue armor, a shield, helmet, and sword
        KING: 49, // an old man with a crown and staff and blue capes
        HIGH_ELF_RANGER_F: 121, // an elf with light gray skin, white hair, green cape, and bow
        DROW_RANGER: 130, // a blue-skinned creature with white hair, a purple shirt, and a red cape
        WOOF_ELF_RANGER_F: 171, // a gray-skinned creature with lipstick, brown hair, a gray shirt, and a gray/orange cape
        TREANT: 201, // a brown tree with no leaves and an unhappy face
        BLACK_WOLF: 243, // a dark grey wolf with red eyes
        COBRA: 248, // a green cobra with red eyes
        BLACK_SPIDER: 251, // a black spider with a red marking on it
        ORC_FIGHTER: 292, // a gray orc with a red cape and a dagger
        GIANT_BLACK_SCORPION: 364, // a black scorpion with yellow eyes
        GREEN_DRAGON: 374, // a green dragon with a small wing
    };
}());