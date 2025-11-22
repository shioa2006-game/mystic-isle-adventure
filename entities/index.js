(function () {
  // エンティティ周りの公開 API を束ねる
  const Game = (window.Game = window.Game || {});

  const types = Game.entityTypes || {};
  const spriteAtlas = Game.spriteAtlas || {};
  const director = Game.enemyDirector || {};

  function isOccupiedByEntity(x, y, scene) {
    const player = Game.state.playerPos;
    if (scene === Game.state.scene && player.x === x && player.y === y) return true;
    const merchant = Game.state.merchant;
    if (merchant.scene === scene && merchant.pos.x === x && merchant.pos.y === y) return true;
    const innkeeper = Game.state.innkeeper;
    if (innkeeper.scene === scene && innkeeper.pos.x === x && innkeeper.pos.y === y) return true;
    const king = Game.state.king;
    if (king && king.scene === scene && king.pos.x === x && king.pos.y === y) return true;
    const priest = Game.state.priest;
    if (priest && priest.scene === scene && priest.pos.x === x && priest.pos.y === y) return true;
    const blacksmith = Game.state.blacksmith;
    if (blacksmith && blacksmith.scene === scene && blacksmith.pos.x === x && blacksmith.pos.y === y) return true;
    return Game.state.enemies.some(
      (enemy) => enemy.scene === scene && enemy.pos.x === x && enemy.pos.y === y
    );
  }

  Game.entities = {
    ACTOR_KIND: types.ACTOR_KIND,
    ENEMY_KIND: types.ENEMY_KIND,
    OBJECT_KIND: types.OBJECT_KIND,
    drawActor: spriteAtlas.drawActor,
    drawEnemy: spriteAtlas.drawEnemy,
    drawObject: spriteAtlas.drawObject,
    drawEnemies: spriteAtlas.drawEnemies,
    spawnInitialEnemies: director.spawnInitialEnemies,
    ensureFieldEnemies: director.ensureFieldEnemies,
    ensureCaveEnemies: director.ensureCaveEnemies,
    ensureCave2Enemies: director.ensureCave2Enemies,
    ensureRuinsEnemies: director.ensureRuinsEnemies,
    onPlayerStep: director.onPlayerStep,
    removeEnemyById: director.removeEnemyById,
    moveEnemiesTowardPlayer: director.moveEnemiesTowardPlayer,
    spawnDragonIfNeeded: director.spawnDragonIfNeeded,
    spawnFixedEnemy: director.spawnFixedEnemy,
    isOccupiedByEntity,
  };
})();
