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

import java.awt.event.*;
import java.util.*;
import java.awt.*;
import javax.swing.*;
import javax.swing.event.*;

public class Editor extends JFrame implements WindowListener{
    private Ladder parent;
	private EditorCanvas theArea;
    
    public Editor(String level, Ladder parent){
        theArea = new EditorCanvas(level);
        this.parent = parent;
        this.setLocation(50, 50);
        this.addWindowListener(this);
		this.addKeyListener(theArea);
        this.setResizable(true);
        this.setTitle("Ladder Level Editor");
        theArea.setFont(new Font("Monospaced", Font.PLAIN, 12));
		this.getContentPane().add(theArea);
        this.pack();
        this.setVisible(true);
    }

	public void windowDeiconified(java.awt.event.WindowEvent event){
	}
	
    public void windowClosed(java.awt.event.WindowEvent event){
	}
	
    public void windowOpened(java.awt.event.WindowEvent event){
	}
	
    public void windowIconified(java.awt.event.WindowEvent event){
	}
	
    public void windowActivated(java.awt.event.WindowEvent event){
    }
    
    public void windowDeactivated(java.awt.event.WindowEvent event){
    }
	
    public void windowClosing(java.awt.event.WindowEvent event){
        parent.setLevel(theArea.getLevel());
        setVisible(false);       // hide the Frame
        dispose();    // free the system resources
    }
}
