/*
 * Part of Ladder, a game.
 * Copyright (C) 1999, 2000 Stephen Ostermiller
 * http://ostermiller.org/contact.pl?regarding=Ladder
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

import java.util.*;

/**
 * This class defines a barrel.  Barrels appear as an 'o' on the screen.
 * The roll down the screen and try to crush the lad.
 */
public class Barrel extends Creature{

	/**
	 * Random Number Generator for this Barrel (static fallback for backwards compatibility).
	 */
	private static Random staticRnum = new Random();

	/**
	 * Instance random number generator for this barrel.
	 */
	private Random rnum;

	/**
	 * Set the random number generator for testing purposes (static/global).
	 * Note: This is deprecated. Use the constructor parameters instead.
	 *
	 * @param random the Random instance to use
	 */
	public static void setRandom(Random random) {
		staticRnum = random;
	}

	/**
	 * Update the random number generator for this barrel instance.
	 * Used when recycling a barrel from the pool to a new producer.
	 *
	 * @param random the Random instance to use (null = use static)
	 */
	public void resetRandom(Random random) {
		this.rnum = random != null ? random : staticRnum;
	}

	/**
	 * Create a new barrel.
	 */
	public Barrel(){
		this(0, 0, Creature.STATIONARY, null);
	}

	/**
	 * Create a new barrel with a custom Random source.
	 *
	 * @param random the Random instance for this barrel (null = use static)
	 */
	public Barrel(Random random){
		this(0, 0, Creature.STATIONARY, random);
	}

	/**
	 * Create a new barrel in the given position.
	 *
	 * @param xpos the x coordinate of the barrel's position
	 * @param ypos the y coordinate of the barrel's position
	 */
	public Barrel(int xpos, int ypos){
		this(xpos, ypos, Creature.STATIONARY, null);
	}

	/**
	 * Create a new barrel in the given position, going the proper direction
	 *
	 * @param xpos the x coordinate of the barrel's position
	 * @param ypos the y coordinate of the barrel's position
	 * @param direction the direction in which the barrel is initially moving
	 */
	public Barrel(int xpos, int ypos, int direction){
		this(xpos, ypos, direction, null);
	}

	/**
	 * Create a new barrel in the given position, going the proper direction, with custom Random.
	 *
	 * @param xpos the x coordinate of the barrel's position
	 * @param ypos the y coordinate of the barrel's position
	 * @param direction the direction in which the barrel is initially moving
	 * @param random the Random instance for this barrel (null = use static)
	 */
	public Barrel(int xpos, int ypos, int direction, Random random){
		this.xpos = xpos;
		this.ypos = ypos;
		this.direction = direction;
		this.rnum = random != null ? random : staticRnum;
		symbol = 'o';
		markedForRecycling = false;
	}

	/**
	 * Whether this barrel has landed on a recycling square and should be removed next frame.
	 */
	private boolean markedForRecycling = false;

	/**
	 * Mark this barrel for recycling (removal at the start of next frame).
	 */
	public void markForRecycling() {
		markedForRecycling = true;
	}

	/**
	 * Check if this barrel is marked for recycling.
	 */
	public boolean isMarkedForRecycling() {
		return markedForRecycling;
	}

	/**
	 * Reset the recycling flag when the barrel is reused.
	 */
	public void resetRecyclingFlag() {
		markedForRecycling = false;
	}

	/**
	 * Reset the barrel's direction and state when reused from the pool.
	 */
	public void resetState() {
		this.direction = Creature.STATIONARY;
	}

	/**
	 * The command go  down.
	 */
	private static final int DOWN = 2;

	/**
	 * The command go left.
	 */
	private static final int LEFT = 4;

	/**
	 * The command go right.
	 */
	private static final int RIGHT = 6;

	/**
	 * The command stop.
	 */
	private static final int STOP = 5;

	/**
	 * Action choices for 4-way random decision.
	 */
	static final int[] LET_RIGHT_DOWN_DECISIONS = {STOP, LEFT, RIGHT, DOWN};

	/**
	 * Action choices for 3-way random decision.
	 */
	static final int[] LEFT_RIGHT_DECISIONS = {STOP, LEFT, RIGHT};

	/**
	 * Cause this barrel to update itself.  This will tell the barrel i
	 * is allowed to move.  The context around the barrel is passed to the barrel.
	 * The barrel uses this context, and its current direction to decide
	 * where it will be next.  Basically the barrel will fall down if nothing is
	 * under it, will move in the direction it was moving if it is not blocked,
	 * and will move randomly right or left if it hits some obstacle.
	 * The context is passed as 9 characters.  The characters are numbered like the
	 * number keypad for easy reference.
	 *
	 * @param one the character an the screen in the one position
	 * @param two the character an the screen in the two position
	 * @param three the character an the screen in the three position
	 * @param four the character an the screen in the four position
	 * @param five the character an the screen in the five position
	 * @param six the character an the screen in the six position
	 * @param seven the character an the screen in the seven position
	 * @param eight the character an the screen in the eight position
	 * @param nine the character an the screen in the nine position
	 */
	public void update(char one, char two, char three, char four, char five, char six,
		char seven, char eight, char nine){
		int go = Barrel.STOP;
		if (two == 'H' && five == 'H' && direction == Creature.DOWN){
			go = Barrel.DOWN;
		} else if (five == 'H' && two == 'H'){
			go = LET_RIGHT_DOWN_DECISIONS[rnum.nextInt(LET_RIGHT_DOWN_DECISIONS.length)];
		} else if (two != '=' && two != '-' && two != '|'){
			go = Barrel.DOWN;
		} else if (five == 'H'){
			go = LEFT_RIGHT_DECISIONS[rnum.nextInt(LEFT_RIGHT_DECISIONS.length)];
		} else if (direction == Creature.LEFT){
			go = Barrel.LEFT;
			if (four == '=' || four == '-' || four == '|'){
				go = Barrel.RIGHT;
			}
		} else if (direction == Creature.RIGHT){
			go = Barrel.RIGHT;
			if (six == '=' || six == '-' || six == '|'){
				go = Barrel.LEFT;
			}
		} else {
			go = LEFT_RIGHT_DECISIONS[rnum.nextInt(LEFT_RIGHT_DECISIONS.length)];
		}
		if (go == Barrel.RIGHT){
			if (six != '=' && six != '-' && six != '|'){
				xpos++;
				direction = Creature.RIGHT;
			}
		} else if (go == Barrel.LEFT){
			if (four != '=' && four != '-' && four != '|'){
				xpos--;
				direction = Creature.LEFT;
			}
		} else if (go == Barrel.DOWN){
			if (two != '=' && two != '-' && two != '|'){
				ypos++;
				direction = Creature.DOWN;
			}
		}
	}
}
