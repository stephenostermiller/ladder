---
title: Ladder
description: An ASCII arcade originally for CPM, rewritten for modern computers
keywords: ladder, game of ladder, der rock, lad, kaypro game, ASCII game, CPM game, open source game, java game, freeware game, GPL game
---

<div id="gameContainer">
<canvas id="gameCanvas"></canvas>
</div>

<div class="game-settings">
<div class="difficulty-select"><select id="difficultySelect"><option value="EASY">Easy</option><option value="MEDIUM" selected>Medium</option><option value="HARD">Hard</option><option value="VERY_HARD">Very Hard</option><option value="IMPOSSIBLE">Impossible</option></select><label for="difficultySelect">Difficulty</label></div>

<div class="level-select"><select id="levelSelect"></select><label for="levelSelect">Level</label></div>

<button id="startButton">Start Game</button>

<div class="controls">
<h3>Controls</h3>
<div>Arrow Keys: Move</div>
<div>Spacebar: Jump</div>
<div>P / Esc: Play and Pause</div>
</div>

<button id="fullscreenButton">Fullscreen</button>
</div>

<script src="ladder.js"></script>
