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

public abstract class Creature{
    protected int xpos;
    protected int ypos;
    protected int direction;
    public static final int UP = 8;
    public static final int DOWN = 2;
    public static final int RIGHT = 6;
    public static final int LEFT = 4;
    public static final int UPLEFT = 7;
    public static final int UPRIGHT = 9;
    public static final int DOWNLEFT = 1;
    public static final int DOWNRIGHT = 3;
    public static final int STATIONARY = 5;
    protected char symbol;
    
    public void Creature(int xpos, int ypos, int direction){
        this.xpos = xpos;
        this.ypos = ypos;
        this.direction = direction;
    }
    
    public char getSymbol(){
        return symbol;
    }
    
    public int getXPos(){
        return xpos;
    }
    
    public int getYPos(){
        return ypos;
    }
    
    public void setXPos(int xpos){
        this.xpos = xpos;
    }
    
    public void setYPos(int ypos){
        this.ypos = ypos;
    }
    
    public int getDirection(){
        return direction;
    }
    
    public abstract void update(char one, char two, char three, char four, char five, char six,
        char seven, char eight, char nine);
    
    public boolean equals(Creature c){
        if (c.getXPos() == xpos && c.getYPos() == ypos){
            return (true);
        } else {
            return (false);
        }
    }
    
    public String toString(){
        return ("" + xpos + "," +ypos);
    }
    
    public int hashCode(){
        return (toString().hashCode());
    }
        
}
    
