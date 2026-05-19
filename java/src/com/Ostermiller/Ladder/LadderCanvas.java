/*
 * Part of Ladder, a game.
 * Copyright (C) 1999-2020
 * Stephen Ostermiller http://ostermiller.org/contact.pl?regarding=Ladder
 * Anthony Howe https://github.com/SirWumpus/Ladder
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
 * See COPYING.TXT for details.
 */

package com.Ostermiller.Ladder;

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.util.*;

/**
 * The LadderCanvas is the UI and threading layer for the game.  The canvas
 * draws the game on itself and drives the game loop. Core game logic lives
 * in GameEngine.
 */
public class LadderCanvas extends JPanel implements Runnable {
	/**
	 * The instance of Ladder which we should report back to.
	 */
	private Ladder caller;

	/**
	 * The core game logic engine.
	 */
	private GameEngine engine;

	/**
	 * Charactaristics of the font.
	 */
	private int letterWidth, letterHeight, letterAcsent;
	/**
	 * Size of the font being used.
	 */
	private int fontSize;
	/**
	 * The font being used.
	 */
	private Font font;
	/**
	 * The command the lad should obey on the next frame.
	 */
	public int nextCommand;
	/**
	 * If the lad should jump on the next frame.
	 */
	public boolean jumpCommand;
	/**
	 * A list of squares that need to be repainted.
	 */
	private Vector<Dimension> repaintList;
	/**
	 * Should the entire screen be repainted on the next refresh?
	 */
	private boolean repaintAll;
	/**
	 * The color of the background.
	 */
	private Color bgColor;
	/**
	 * The color of the foreground.
	 */
	private Color fgColor;
	/**
	 *
	 */
	private boolean gameStop;
	/**
	 *
	 */
	public Thread ladderCanvasThread;
	/**
	 * The level of difficulty for the game.
	 */
	private int difficulty;
	/**
	 * pause in ms between frames.
	 */
	private int gameSpeed;
	/**
	 *
	 */
	boolean stopThread;
	/**
	 *
	 */
	private boolean go_on = false;
	/**
	 * The time at which the last beep occurred.
	 */
	private long lastBeep;

	/**
	 * Debug mode that lets us move the game one frame at a time
	 * by pressing enter between each frame.
	 */
	private static final boolean STEP_MODE = false;

	/**      */
	public static final int SCORE_RESET = 0;
	/**      */
	public static final int SCORE_BARREL = 1;
	/**      */
	public static final int SCORE_STATUE = 2;
	/**      */
	public static final int SCORE_MONEY = 3;

	/**      */
	public static final int G_O_NOT_OVER = GameEngine.G_O_NOT_OVER;
	/**      */
	public static final int G_O_BARREL = GameEngine.G_O_BARREL;
	/**      */
	public static final int G_O_TIME = GameEngine.G_O_TIME;
	/**      */
	public static final int G_O_MONEY = GameEngine.G_O_MONEY;
	/**      */
	public static final int G_O_QUIT = GameEngine.G_O_QUIT;
	/**      */
	public static final int G_O_SPIKE = GameEngine.G_O_SPIKE;

	// minimum number of barrels per producer at the level
	/**      */
	public static final int EASY = 3;
	/**      */
	public static final int MEDIUM = 5;
	/**      */
	public static final int HARD = 7;
	/**      */
	public static final int VERY_HARD = 10;
	/**      */
	public static final int IMPOSSIBLE = 15;

	// game speed at the level (milliseconds between frames)
	/**      */
	private static final int EASY_SPEED = 130;
	/**      */
	private static final int MEDIUM_SPEED = 100;
	/**      */
	private static final int HARD_SPEED = 80;
	/**      */
	private static final int VERY_HARD_SPEED = 65;
	/**      */
	private static final int IMPOSSIBLE_SPEED = 55;

	/**
	 * Create a ladder canvas.
	 *
	 * @param level String representation of the level
	 * @param caller The instance of ladder that called this, which we can
	 *     report back to with scores and such
	 */
	public LadderCanvas(String level, Ladder caller){
		this(new Level(level), caller);
	}

	/**
	 * Create a ladder canvas.
	 *
	 * @param level the level to use.
	 * @param caller The instance of ladder that called this, which we can
	 *     report back to with scores and such
	 */
	public LadderCanvas(Level level, Ladder caller){
		lastBeep = 0;
		gameStop = false;
		this.caller = caller;
		bgColor = Color.black;
		fgColor = Color.green;
		repaintList = new Vector<Dimension>();

		addKeyListener(new KeyAdapter(){
			public void keyPressed(KeyEvent ke){
				int keycode = ke.getKeyCode();
				if (keycode == KeyEvent.VK_ESCAPE){
					LadderCanvas.this.caller.togglePause();
				} else if (keycode == KeyEvent.VK_UP || keycode == KeyEvent.VK_NUMPAD8){
					nextCommand = Lad.UP;
				} else if (keycode == KeyEvent.VK_DOWN || keycode == KeyEvent.VK_NUMPAD2){
					nextCommand = Lad.DOWN;
				} else if (keycode == KeyEvent.VK_LEFT || keycode == KeyEvent.VK_NUMPAD4){
					nextCommand = Lad.LEFT;
				} else if (keycode == KeyEvent.VK_RIGHT || keycode == KeyEvent.VK_NUMPAD6){
					nextCommand = Lad.RIGHT;
				} else if (keycode == KeyEvent.VK_SPACE){
					jumpCommand = true;
				} else if (STEP_MODE && keycode == KeyEvent.VK_ENTER){
					go_on = true;
				} else {
					nextCommand = Lad.STOP;
				}
			}
		});
		addFocusListener(new FocusAdapter(){
			public void focusLost(FocusEvent e){
				LadderCanvas.this.requestFocus();
			}
		});
		nextCommand = Lad.STOP;
		jumpCommand = false;
		setBackground(bgColor);
		caller.setBackground(bgColor);
		caller.getContentPane().setBackground(bgColor);
		setFontSize(12);

		engine = new GameEngine(level, new GameEngine.Callback() {
			public void onScoreChanged(long score) {
				LadderCanvas.this.caller.setScore(score);
			}
			public void onLadsChanged(int lads) {
				LadderCanvas.this.caller.setLads(lads);
			}
			public void onBonusTimeChanged(int time) {
				LadderCanvas.this.caller.setBonusTime(time);
			}
			public void onBeep() {
				LadderCanvas.this.beep();
			}
		});

		repaintAll = true;
		setDifficulty(MEDIUM);
		setOpaque(true);
	}

	/**
	 * Set the size of the font used.
	 *
	 * @param size the size of the font in points
	 */
	public void setFontSize(int size){
		setFont(font = new Font("Monospaced", Font.PLAIN, size));
		FontMetrics fontMetrics = this.getFontMetrics(font);
		letterWidth = fontMetrics.charWidth('m');
		letterHeight = fontMetrics.getHeight();
		letterAcsent = fontMetrics.getAscent();
		fontSize = size;
	}

	/** get the size of the font being used.
	 *
	 * @return the size of the font in points.
	 */
	public int getFontSize(){
		return fontSize;
	}

	/**
	 * Set the background color.
	 *
	 * @param bg Color to use for the background.
	 */
	public void setBGColor(Color bg){
		bgColor = bg;
		setBackground(bgColor);
		caller.setBackground(bgColor);
		caller.getContentPane().setBackground(bgColor);
		repaintAll = true;
		repaint();
	}

	/**
	 * Set the foreground color.
	 *
	 * @param fg Color to use for the foreground.
	 */
	public void setFGColor(Color fg){
		fgColor = fg;
		repaintAll = true;
		repaint();
	}

	/**
	 * Get the background color.
	 *
	 * @return Color currently used for the background.
	 */
	public Color getBGColor(){
		return(new Color(bgColor.getRGB()));
	}

	/**
	 * Get the foreground color.
	 *
	 * @return Color currently used for the foreground.
	 */
	public Color getFGColor(){
		return(new Color(fgColor.getRGB()));
	}

	/**
	 * Change the level to the one given and repaint.
	 *
	 * @param level A string representing the desired level.
	 */
	public void setLevel(String level){
		setLevel(new Level(level));
	}

	public void setLevel(Level level){
		engine.setLevel(level);
		repaintAll = true;
		repaint();
	}

	/**
	 * get the preferred size
	 *
	 * @return the preferred size in pixels
	 */
	public Dimension getPreferredSize() {
		return getMinimumSize();
	}

	/**
	 * gets the minimum size
	 *
	 * @return the minimum size in pixels
	 */
	public synchronized Dimension getMinimumSize() {
		return new Dimension(
			letterWidth * engine.realLevel.getColumnCount(),
			letterHeight * engine.realLevel.getRowCount());
	}

	/**
	 * paints the canvas
	 *
	 * @param g graphics object for this component
	 */
	public void paintComponent(Graphics g){
		g.setColor(bgColor);
		Rectangle bounds = g.getClipBounds();
		g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		g.setColor(fgColor);

		int rowStart = bounds.y / letterHeight;
		int rowEnd = (bounds.y + bounds.height + letterHeight) / letterHeight;
		int columnStart = bounds.x / letterWidth;
		int columnEnd = (bounds.x + bounds.width + letterWidth) / letterWidth;

		for (int i = rowStart; i < rowEnd && i < engine.realLevel.getRowCount(); i++){
			g.drawChars(engine.screenLevel.getCharsAt(i, columnStart, columnEnd - columnStart - 1),
				0, columnEnd-columnStart-1,
				(columnStart)*letterWidth, i * letterHeight + letterAcsent);
		}
		if (gameStop){
			g.setColor(Color.red);
			g.setFont(new Font("SansSerif", Font.BOLD, font.getSize() * 2));
			String p = "GAME OVER";
			g.drawString(p, (getWidth() - g.getFontMetrics().stringWidth(p)) / 2,
				(getHeight()) / 2);
		} else if (stopThread){
			g.setColor(Color.red);
			g.setFont(new Font("SansSerif", Font.BOLD, font.getSize() * 2));
			String p = "PAUSED";
			g.drawString(p, (getWidth() - g.getFontMetrics().stringWidth(p)) / 2,
				(getHeight()) / 2);
		}
		repaintAll = true;
	}

	/**
	 * repaints just the region containing a character on the screen
	 *
	 * @param xpos the x position of the character
	 * @param ypos the y position of the character
	 */
	private void repaintCharAt(int xpos, int ypos){
		repaint((xpos-1)*letterWidth, (ypos-1)*letterHeight, letterWidth,letterHeight);
	}

	/**
	 * start the game moving
	 */
	public void start(){
		if (ladderCanvasThread == null || !ladderCanvasThread.isAlive()){
			ladderCanvasThread = new Thread(this);
		}
		ladderCanvasThread.start();
		repaint();
	}

	/**
	 * stop the game from moving
	 */
	public void stop(){
		stopThread = true;
		repaint();
	}

	/**
	 * reset the game to its initial state, (score, lads, (everything))
	 */
	public void resetGame(){
		engine.resetGame();
		repaintAll = true;
		repaint();
	}

	/**
	 * resets the clocks for the game, but not the score, lives left, etc.
	 */
	public void reset(){
		gameStop = false;
		engine.reset();
	}

	/**
	 * Set the difficulty for the game
	 *
	 * @param difficulty level of difficulty
	 */
	public void setDifficulty(int difficulty){
		switch (difficulty){
		case EASY:
			gameSpeed = EASY_SPEED;
		break;
		case MEDIUM:
			gameSpeed = MEDIUM_SPEED;
		break;
		case HARD:
			gameSpeed = HARD_SPEED;
		break;
		case VERY_HARD:
			gameSpeed = VERY_HARD_SPEED;
		break;
		case IMPOSSIBLE:
			gameSpeed = IMPOSSIBLE_SPEED;
		break;
		}
	}

	/**
	 * Runs the game loop.
	 */
	public void run(){
		stopThread = false;
		long beginLoopTime = System.currentTimeMillis();
		long endLoopTime;
		int sleepTime;
		while (!gameStop && !stopThread){
			try{
				while (engine.gameOver == G_O_NOT_OVER && !stopThread){
					int gameOver = engine.tick(nextCommand, jumpCommand);
					nextCommand = Lad.NONE;
					jumpCommand = false;

					if (gameOver == G_O_MONEY){
						repaint();
					}
					if (gameOver != G_O_NOT_OVER){
						throw (new GameOverException());
					}

					repaintAll = false;
					repaint();

					endLoopTime = System.currentTimeMillis();
					sleepTime = (int)(gameSpeed - (endLoopTime - beginLoopTime));
					if (sleepTime > 0){
						try{
							Thread.sleep(sleepTime);
						} catch (InterruptedException e){
						}
					}
					if (STEP_MODE){
						while (!go_on){
							try{
								Thread.sleep(100);
							} catch (InterruptedException e){
							}
						}
						go_on = false;
					}
					beginLoopTime = System.currentTimeMillis();
				}
			} catch (GameOverException e){
			}

			switch (engine.gameOver){
			case G_O_BARREL: case G_O_TIME: case G_O_SPIKE:
				ladDeath();
				engine.loseLad();
				if (engine.getLadsLeft() > 0){
					engine.reset();
					gameStop = false;
				} else {
					gameStop = true;
					caller.gameOver(engine.getScore());
					repaint();
				}
			break;
			case G_O_MONEY:
				dollarCountdown();
				caller.changeLevel();
				engine.reset();
				gameStop = false;
			break;
			case G_O_NOT_OVER:
				gameStop = false;
			break;
			default:
				gameStop = true;
				repaint();
			break;
			}
		}
	}

	/**
	 * Slowly increments the score as the bonus time is decremented for the end of the
	 * level countdown.
	 */
	private void dollarCountdown(){
		while (engine.cycles > 0){
			caller.setBonusTime(engine.cycles);
			engine.scoreMoney();
			engine.cycles -= 10;
			try{
				Thread.sleep(10);
			} catch (InterruptedException e){
			}
		}
		caller.setBonusTime(0);
	}

	/**
	 * sounds a beep.
	 */
	private void beep(){
		if (System.currentTimeMillis() - lastBeep > 150){
			getToolkit().beep();
			lastBeep = System.currentTimeMillis();
		}
	}

	/**
	 * kill the lad off in a horrible death of mixed up characters.
	 */
	private void ladDeath(){
		int i;
		long beginLoopTime, endLoopTime;
		char[] symbols = {'!', '@', '#', '/', '+', '%', '?', '\\', '*', 'b'};
		int sleepTime;
		for (i=0; i<symbols.length; i++){
			beginLoopTime = System.currentTimeMillis();
			beep();
			engine.screenLevel.setCharAt(engine.getLadY()-1, engine.getLadX()-1, symbols[i]);
			repaint();
			endLoopTime = System.currentTimeMillis();
			sleepTime = (int)(gameSpeed - (endLoopTime - beginLoopTime));
			if (sleepTime > 0){
				try{
					Thread.sleep(50);
				} catch (InterruptedException e){
				}
			}
		}
	}

	/**
	 * Some key has been pressed, react to it.
	 *
	 * @param ke The key event corresponding to the key
	 */
	public void keyPressed(KeyEvent ke){
		int keycode = ke.getKeyCode();
		if (keycode == KeyEvent.VK_UP || keycode == KeyEvent.VK_NUMPAD8){
			nextCommand = Lad.UP;
		} else if (keycode == KeyEvent.VK_DOWN || keycode == KeyEvent.VK_NUMPAD2){
			nextCommand = Lad.DOWN;
		} else if (keycode == KeyEvent.VK_LEFT || keycode == KeyEvent.VK_NUMPAD4){
			nextCommand = Lad.LEFT;
		} else if (keycode == KeyEvent.VK_RIGHT || keycode == KeyEvent.VK_NUMPAD6){
			nextCommand = Lad.RIGHT;
		} else if (keycode == KeyEvent.VK_SPACE){
			jumpCommand = true;
		} else if (keycode == KeyEvent.VK_ESCAPE){
			//escape is used to pause the game, lets ignore it here
			//it should be caught by main ladder class.
		} else if (STEP_MODE && keycode == KeyEvent.VK_ENTER){
			go_on = true;
		} else {
			nextCommand = Lad.STOP;
		}
	}
}
