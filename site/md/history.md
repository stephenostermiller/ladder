---
title: Ladder Version History
description: Version history and changelog for Java version of the ASCII arcade game.
keywords: ladder history, history of ladder
---

- **[Ladder 1.3](ladder_1_3.jar)** (Executable Jar - 102K) December 2005 - Requires Java 1.5
  - Fixed background color issues under Java 1.5.

- **[Ladder 1.2](ladder_1_2.jar)** (Executable Jar - 124k) June 2002 - Requires Java 1.3
  - Ladder 2 Levels included.
  - Focus problems that occasionally caused the keyboard to stop responding are solved.
  - Fixed a bug that allowed the lad to bounce off a trampoline through a wall.
  - Bonus time counts the whole way down to zero when the lad reaches the dollar sign.

- **[Ladder 1.1](ladder_1_1.jar)** (Executable Jar - 86k) December 2000 - Requires Java 1.3
  - Major code refactoring that results in improved speed and lower memory usage.
  - High score list.
  - The order of levels is now like the original: you must play all levels to get a new level.
  - Bugs fixed that allowed the lad to go through walls and ceilings under some circumstances.
  - Lad death effect retimed.
  - The game indicates that it is paused or that the game is over.

- **[Ladder 1.0](ladder_1_0.jar)** (Executable Jar - 68k) February 2000 - Requires Java 1.2
  - The lad will move up the ladder after a jump if you press the up key during the jump, or even before it.
  - Better javadoc documentation on the source code.
  - New levels: [Plinko Place](newLevel.html#PlinkoPlace) and [One Chance](newLevel.html#OneChance).

- **[Ladder 0.4](ladder_0_4.jar)** (Executable Jar - 24k) December 1999 - Requires Java 1.2
  - Occasional gray flashes in the background are gone.
  - Ladder is now in the com.Ostermiller.Ladder package.
  - Ladder is now in an executable jar file.
  - User preferences are stored in $USER_HOME_DIR/.java/Ladder/LadderUser.ini.

- **Ladder 0.3a**
  - Beeps!
  - Entire new engine for moving the lad around! The lad now can wait until it can move in a any direction to go that way.
  - Running the lad into a . makes the lad do more unpredictable things.
  - Disappearing floors and gold statues no longer reappear when you lose a life
  - Keyboard shortcuts on menus.
  - Adjustable font.
  - Money countdown when end of level reached.
  - Lad dies a horrible death of mixed up symbols.
  - Speed problems fixed.
  - Color choosers added for picking the background and foreground colors.
  - The stats at the bottom of the screen are displayed better.
  - Pausing the game from the menu works correctly again.
  - The display upgraded to javax.swing rather than java.awt. This has resulted in some major speed enhancements and bug fixes due to double buffering native to swing, however ladder will no longer run under java 1.1.x or less.
  - Redraw errors fixed. Der rocks should never leave marks behind as they move
  - Lad moves better. Can now make a second jump in the middle of a first jump. Also continues past ladders at the end of a jump now

- **Ladder 0.2a**
  - .ini files to save preferences.
  - Scoring, time, and number of lads working.
  - All features of original game included (statues, goal, spikes, dots, etc.).
  - Included the original levels from the original game.
  - Background and Foreground color work better.
  - .ini file support added to save some options when game is quit.
  - Bugs in how the lad moves around fixed.
  - The lad should not lose the keyboard focus anymore.
  - Levels cycle properly.
  - New game restarts at the first level.
  - Java 1.2 compliance (deprecation of Thread.stop()) (Still 1.1 compliant!)
  - Speed change added to level difficulty (as well as more rocks)
  - New code for reading in levels that is more robust. (Doesn't care that all lines same length for example.)

- **Ladder 0.1a**
  - Basic game functionality.
  - Ability to load a level from a text file (And save edited level).
  - Simple level editor.
  - Preliminary ability to change the color scheme.
  - Some level difficulty (more der rocks).
