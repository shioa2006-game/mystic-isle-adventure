const fs = require('fs');
const vm = require('vm');
const path = require('path');
const base = 'c:/Users/shioa/OneDrive/Documents/1_MyProgramFiles/mystic-isle-adventure';
const context = {
  console,
  window: {},
  document: {},
  navigator: {},
  performance: { now: () => 0 },
};
context.window = context;
context.window.console = console;
context.window.performance = context.performance;
context.window.document = context.document;
context.window.navigator = context.navigator;
context.window.alert = console.log;
context.window.LEFT_ARROW = 37;
context.window.RIGHT_ARROW = 39;
context.window.UP_ARROW = 38;
context.window.DOWN_ARROW = 40;
context.window.ENTER = 13;
context.window.ESCAPE = 27;
context.window.Game = context.Game = {};
context.window.Math = Math;
context.window.setTimeout = () => {};
context.window.clearTimeout = () => {};
function load(rel) {
  const file = path.join(base, rel);
  const code = fs.readFileSync(file, 'utf8');
  vm.runInNewContext(code, context, { filename: rel });
}
const files = [
'config.js',
'constants.js',
'data/items.js',
'data/enemies.js',
'data/maps/field.js',
'data/maps/town.js',
'data/maps/cave_b1.js',
'data/maps/cave_b2.js',
'utils.js',
'state/player_state.js',
'state/occupancy.js',
'state/ui_state.js',
'messages/log.js',
'game_state.js',
'save_system.js',
'map_data.js',
'entities/entity_types.js',
'entities/sprite_atlas.js',
'entities/enemy_director.js',
'entities/index.js',
'renderer/layout.js',
'renderer/camera.js',
'renderer/text_utils.js',
'renderer/map_layer.js',
'renderer/entity_layer.js',
'renderer/ui_panel.js',
'renderer/overlay_layer.js',
'renderer/index.js',
'dialogue.js',
'combat.js',
'shop.js',
'inn.js',
'input/movement_controller.js',
'input/overlay_controller.js',
'input/battle_input.js',
'input/index.js'
];
for (const file of files) {
  try {
    load(file);
  } catch (error) {
    console.error('Error loading', file, error);
    throw error;
  }
}
context.Game.initializeGame();
console.log('overlay', context.Game.ui.state.overlay);
