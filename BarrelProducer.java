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

public class BarrelProducer{
    private Random rnum;
    private Vector barrels;
    protected int xpos;
    protected int ypos;
    private static final int MAX_BARRELS = 30;
    private int minBarrels;
    private boolean recycled;
    
    
    public BarrelProducer(int xpos, int ypos){
        this.xpos = xpos;
        this.ypos = ypos;
        recycled = false;
        barrels = new Vector();
        minBarrels = 7;
		rnum = new Random();
		try{
			Thread.currentThread().sleep(10); // sleep to allow the time to increase and the random number to get seeded differently
		} catch (InterruptedException e){
		}
	}
    
    public void setMinBarrels(int num){
        minBarrels = num;
    }
    
    public void recycleBarrel(Barrel barrel){
        barrel.setXPos(xpos);
        barrel.setYPos(ypos);
        recycled = true;
        
    }
    
    public Vector getBarrels(){
        return (barrels);
    }   
    
    public void update(){
        if ((!recycled || barrels.size()< minBarrels) && barrels.size()<MAX_BARRELS){
            double num = rnum.nextDouble();
            if (num < (double)1/15){
                barrels.addElement(new Barrel(xpos,ypos,Creature.STATIONARY));
            }
        }
    }    
}
