/*
 * Part of Ladder, a game.
 * Copyright (C) 1999  Stephen Ostermiller <Ladder@Ostermiller.com>
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
 * A BarrelProducer is usually represented as a V on the screen.  It sends out the barrels which then are behave according to the rules of the barrel.  The barrel producer then recycles the barrel when it is destroyed.  It mainains a list of barrels and sends them out randomly.
 * 
 */
public class BarrelProducer{
    /** 
     * The random number producer for this class
     * 
     */
    private static Random rnum = new Random();
    /** 
     * The list of barrels available for use.  This list is kept so that we don't have to continually create new instances of barrels, which would slow the application down due to excessive garbage collection.
     * 
     */
    private Vector barrels;
    /** 
     * The x coordinate of this barrel producer
     * 
     */
    protected int xpos;
    /** 
     * The y coordinate of this barrel producer
     * 
     */
    protected int ypos;
    /** 
     * The maximum number of barrels available to be outputted by this BarrelProducer.  After this number is reached, the barrels must be recycled when they are destroyed.
     * 
     */
    private static final int MAX_BARRELS = 30;
    /** 
     * The minimum number of Barrels this BarrelProducer should spit out.  It usually spits out new barrels until one is recycled.  Using this, you can tell it to spit out barrels until some number have been sent out, even if some are recycled first.
     * 
     */
    private int minBarrels;
    /** 
     * Has a barrel been recycled yet?
     * 
     */
    private boolean recycled;
    
    
    /**
     * Creates a new barrel producer at the given coordinate
     *
     * @param xpos The x coordinate of this barrel producer
     * @param ypos The y coordinate of this barrel producer
     */
    public BarrelProducer(int xpos, int ypos){
        this.xpos = xpos;
        this.ypos = ypos;
        recycled = false;
        barrels = new Vector();
        minBarrels = 7;
	}
    
    /** 
     * Sets the minumum number of barrels produced.
     * It usually spits out new barrels until one is recycled.
     * Using this, you can tell it to spit out barrels until some number have been
     * sent out,
     * even if some are recycled first.
     * 
     * @param num The minimum number of Barrels this BarrelProducer should 
     *     spit out.
     */
    public void setMinBarrels(int num){
        minBarrels = num;
    }
    
    /** 
     * Send a barrel back to be recycled.  Done so that new instances of barrels do
     * not continually need to be created slowing down garbage collection.
     * 
     * @param barrel The barrel to be recyled
     */
    public void recycleBarrel(Barrel barrel){
        barrel.setXPos(xpos);
        barrel.setYPos(ypos);
        recycled = true;
    }
    
    /** 
     * Get the vector or Barrels.  The barrel producer keeps this vector for garbage
     * collection purposes.
     * 
     * @return the vector of Barrels this producer has spit out.
     */
    public Vector getBarrels(){
        return (barrels);
    }   
    
    /** 
     * Update this Barrel producer.
     * Should be called once per frame of the game.
     * May cause a new barrel to be spit out.
     * 
     */
    public void update(){
        if ((!recycled || barrels.size()< minBarrels) && barrels.size()<MAX_BARRELS){
            double num = rnum.nextDouble();
            if (num < (double)1/15){
                barrels.addElement(new Barrel(xpos,ypos,Creature.STATIONARY));
            }
        }
    }    
}
