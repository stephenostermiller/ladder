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

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import java.io.*;
import java.util.*;
import java.net.*;


/** 
 * Ladder is a classic computer game originally written for the CPM
 * operating system.  It is entirly based in ASCII characters.
 */
public class Ladder extends JFrame implements  ActionListener, WindowListener, ItemListener{
    /** 
     * The canvas that displays the main part of the game
     */
	private LadderCanvas ladderCanvas;
	/** 
     * the menu bar at the top of the screen
     */
    private JMenuBar ladderMenuBar;
	/** 
     * menus on the menu bar
     */
    private JMenu fileMenu, editMenu, optionsMenu, difficultyMenu, levelMenu;
	/**  
     * menu items in the menus
     */
	private JMenuItem openItem, editItem, saveItem, newItem, bgItem, 
        fgItem, exitItem, fontItem;
    /**      
     *
     */
    private JCheckBoxMenuItem pauseItem;
    /**      
     *
     */
    private JRadioButtonMenuItem easyItem, mediumItem, 
        hardItem, veryHardItem, impossibleItem;
    /**      
     *
     */
    private ButtonGroup difficultyGroup, levelGroup;
	/**      
     * for displaying the score and lives left and stuff
     */
    private JLabel ladField, levelField, scoreField, bonusTimeField;
	/** 
     * the text representation of the current level
     */
    private String level;
    /** 
     * Is the game running, as opposed to over, not started, or paused?
     */
    private boolean running;
    /**      
     *
     */
    private Properties defaultProps, props;
    /**      
     *
     */
    private Vector LevelMenuItems;
    /** 
     * Vector of files to load as levels
     */
    private Vector LevelFiles;
    /** 
     * the number of the current level being played
     */
    private int currLevel;
    /**      
     *
     */
    private Color bgColor, fgColor;
	
    /** 
     * Array of choices for font sizes.
     * 
     */
	private final static Integer[] FONT_SIZES = new Integer[16];
    
    /** 
     * Create a new Ladder game.
     */
    public Ladder(){
    	FONT_SIZES[0] = new Integer(8);
    	FONT_SIZES[1] = new Integer(9);
    	FONT_SIZES[2] = new Integer(10);
    	FONT_SIZES[3] = new Integer(11);
		FONT_SIZES[4] = new Integer(12);
    	FONT_SIZES[5] = new Integer(14);
    	FONT_SIZES[6] = new Integer(16);
    	FONT_SIZES[7] = new Integer(18);
		FONT_SIZES[8] = new Integer(20);
    	FONT_SIZES[9] = new Integer(22);
    	FONT_SIZES[10] = new Integer(24);
		FONT_SIZES[11] = new Integer(26);
    	FONT_SIZES[12] = new Integer(28);
    	FONT_SIZES[13] = new Integer(36);
    	FONT_SIZES[14] = new Integer(48);
		FONT_SIZES[15] = new Integer(72);

        loadProperties();
		running = false;
        //Build the menu bar.
        ladderMenuBar = new JMenuBar();
        setJMenuBar(ladderMenuBar);
		difficultyGroup = new ButtonGroup();
		levelGroup = new ButtonGroup(); 
        //Build first menu in the menu bar.
        //Specifying the second argument as true
        //makes this a tear-off menu.
        fileMenu = new JMenu("File", true);
		fileMenu.setMnemonic('f');
		ladderMenuBar.add(fileMenu);
        openItem = new JMenuItem("Open Level...", 'o');
        openItem.addActionListener(this);
        fileMenu.add(openItem);
        saveItem = new JMenuItem("Save Level...", 's');
        saveItem.addActionListener(this);
        fileMenu.add(saveItem);
        newItem = new JMenuItem("New Game", 'n');
		newItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F2, 0));
        newItem.addActionListener(this);
        fileMenu.add(newItem);
        exitItem = new JMenuItem("Exit", 'x');
		exitItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F4, ActionEvent.ALT_MASK));
        exitItem.addActionListener(this);
        fileMenu.add(exitItem);

        //Build second menu in the menu bar.
        editMenu = new JMenu("Edit");
		editMenu.setMnemonic('e');
        ladderMenuBar.add(editMenu);
        pauseItem = new JCheckBoxMenuItem("Pause", false);
		pauseItem.setMnemonic('p');
		pauseItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F3, 0));
        pauseItem.addItemListener(this);
        editMenu.add(pauseItem);
        editItem = new JMenuItem("Edit Level...", 'd');
        editItem.addActionListener(this);
        editMenu.add(editItem);
		
		//Build the Options menu bar
		optionsMenu = new JMenu("Options");
		optionsMenu.setMnemonic('o');
        ladderMenuBar.add(optionsMenu);
		fontItem = new JMenuItem("Font Size...", 'z');
        fontItem.addActionListener(this);
        optionsMenu.add(fontItem);
        bgItem = new JMenuItem("Background Color...", 'b');
        bgItem.addActionListener(this);
        optionsMenu.add(bgItem);
        fgItem = new JMenuItem("Foreground Color...", 'f');
        fgItem.addActionListener(this);
        optionsMenu.add(fgItem);
        
		//Build the difficulty menu bar
        difficultyMenu = new JMenu("Difficulty");
		difficultyMenu.setMnemonic('d');
        ladderMenuBar.add(difficultyMenu);
        easyItem = new JRadioButtonMenuItem("Easy");
		easyItem.setMnemonic('e');
		difficultyGroup.add(easyItem);
        easyItem.addActionListener(this);
        difficultyMenu.add(easyItem);
        mediumItem = new JRadioButtonMenuItem("Medium", true);
		mediumItem.setMnemonic('m');
		difficultyGroup.add(mediumItem);
        mediumItem.addActionListener(this);
        difficultyMenu.add(mediumItem);
        hardItem = new JRadioButtonMenuItem("Hard");
		hardItem.setMnemonic('h');
		difficultyGroup.add(hardItem);
        hardItem.addActionListener(this);
        difficultyMenu.add(hardItem);
        veryHardItem = new JRadioButtonMenuItem("Very Hard");
		veryHardItem.setMnemonic('v');
		difficultyGroup.add(veryHardItem);
        veryHardItem.addActionListener(this);
        difficultyMenu.add(veryHardItem);
        impossibleItem = new JRadioButtonMenuItem("Impossible");
		impossibleItem.setMnemonic('i');
		difficultyGroup.add(impossibleItem);
        impossibleItem.addActionListener(this);
        difficultyMenu.add(impossibleItem);
        
        levelMenu = new JMenu("Level");
		levelMenu.setMnemonic('l');
        ladderMenuBar.add(levelMenu);
        LevelMenuItems = new Vector();
        LevelFiles = new Vector();

        // load the levels from the property file.
        int i = 1;
        String s = props.getProperty("Level1Name", "");
        String s1 = props.getProperty("Level1", "");
        JRadioButtonMenuItem m;
        currLevel = 1; 
		// add the names of the levels to the menu       
        while (s1.compareTo("") != 0){
            if (s.compareTo("") == 0){
                s = "Level " + i;
            }
            if (i==1){
                m = new JRadioButtonMenuItem(s, true);
            } else {
                m = new JRadioButtonMenuItem(s, false);
            }
            
			//m.setMnemonic((char)i);
			levelMenu.add(m);
            m.addActionListener(this);
			levelGroup.add(m);
            LevelMenuItems.addElement(m);                        
            LevelFiles.addElement(s1);
            i++;
            s = props.getProperty("Level" + i + "Name", "");
            s1 = props.getProperty("Level" + i, "");
        }
        
		// put the labels at the bottom of the screen
        ladField = new JLabel();
	    ladField.setText("Lads     3");
        ladField.setBackground(Color.lightGray);
        ladField.setForeground(Color.black);

        levelField = new JLabel();
        levelField.setText("Level     1");
        levelField.setBackground(Color.lightGray);
        levelField.setForeground(Color.black);

        scoreField = new JLabel();
		scoreField.setText("Score     0");
        scoreField.setBackground(Color.lightGray);
        scoreField.setForeground(Color.black);

        bonusTimeField = new JLabel();
		bonusTimeField.setText("Bonus time     2000");
        bonusTimeField.setBackground(Color.lightGray);
        bonusTimeField.setForeground(Color.black);
        
        level = nextLevel(1); // Load the first level        
        
		// initialize the game
        ladderCanvas = new LadderCanvas(level, this);
		this.addKeyListener(ladderCanvas); // key events need to get passed to the ladder canvas
		
		// lay out this frame using a grid bag layout
        GridBagLayout gridbag = new GridBagLayout();
        GridBagConstraints c = new GridBagConstraints();

        c.gridx = 0;
        c.gridy = 0;
        c.gridheight = 1;
        c.gridwidth = GridBagConstraints.REMAINDER;
        c.fill= GridBagConstraints.NONE;
        gridbag.setConstraints(ladderCanvas, c);
        this.getContentPane().add(ladderCanvas);

        c.gridx = 0;
        c.gridy = 1;
        c.gridheight = 1;
        c.gridwidth = 1;
		c.ipadx = 30;
        gridbag.setConstraints(ladField, c);
        this.getContentPane().add(ladField);
        
        c.gridx = 1;
        c.gridy = 1;
        c.gridheight = 1;
        c.gridwidth = 1;
        gridbag.setConstraints(levelField, c);
        this.getContentPane().add(levelField);

        c.gridx = 2;
        c.gridy = 1;
        c.gridheight = 1;
        c.gridwidth = 1;
        gridbag.setConstraints(scoreField, c);
        this.getContentPane().add(scoreField);

        c.gridx = 3;
        c.gridy = 1;
        c.gridheight = 1;
        c.gridwidth = 1;
        gridbag.setConstraints(bonusTimeField, c);
        this.getContentPane().add(bonusTimeField);
        
        this.getContentPane().setLayout(gridbag);

		bgColor = Color.black;
		fgColor = Color.green;
		int bg, fg;
        try {
            bg = Integer.decode(props.getProperty("Background Color", "" + Color.black.getRGB())).intValue();
        } catch (NumberFormatException e){
            bg = Color.black.getRGB();
        }
        try {
            fg = Integer.decode(props.getProperty("Foreground Color", "" + Color.green.getRGB())).intValue();
        } catch (NumberFormatException e){
            fg = Color.green.getRGB();
        }
		ladderCanvas.setBGColor(new Color(bg));
		ladderCanvas.setFGColor(new Color(fg));
		
		int fs;
		try {
            fs = Integer.decode(props.getProperty("Font Size", "12")).intValue();
        } catch (NumberFormatException e){
            fs = 12;
        }
		ladderCanvas.setFontSize(fs);

        // decide on the position of the frame on the screen
        int x, y;
        try {
            x = Integer.decode(props.getProperty("WindowX", "50")).intValue();
        } catch (NumberFormatException e){
            x = 50;
        }
        try {
            y = Integer.decode(props.getProperty("WindowY", "50")).intValue();
        } catch (NumberFormatException e){
            y = 50;
        }
        this.setLocation(x, y);
        this.addWindowListener(this);
        this.setResizable(true);
        this.setTitle("Ladder");        
        this.pack();
        running = true;
    }
    
    /** 
     * Neaten the given level.
     * make lines the same length, etc.
     * 
     * @param level the level to neaten
     * @return the neatened level.
     */
    public static String neatenLevel(String level){
        Vector v = new Vector();
        StringBuffer levelBuffer = new StringBuffer();
        StringBuffer levelLine = new StringBuffer();
        int maxLength = 0;
        boolean appended = false;
        // for each character in the level
        for (int i=0; i<level.length(); i++){
            // if the character doesn't represent a new line
            if (level.charAt(i) != '\n' && level.charAt(i) != '\r'){
                // append it to the line
                levelLine.append(level.charAt(i));
                appended = false;
            } else {
                // windows new line format....
                if(i+1 < level.length() && level.charAt(i) == '\r' && level.charAt(i+1) == '\n'){
                    // skip the '\r' as part of the same line
                    i++;
                }
                // find the longest line
                if (levelLine.length() > maxLength){
                    maxLength = levelLine.length();
                }
                // save the line for later
                v.addElement(levelLine);
                appended = true;
                //System.out.println("" + levelLine);
                // create a new levelLine so it isn't overwritten
                levelLine = new StringBuffer();
            }      
        }
        if (!appended){  // if the last line was not appended (because it didn't end with a return), append it
            v.addElement(levelLine);
			if (levelLine.length() > maxLength){
                maxLength = levelLine.length();
            }
        }
        for (int i=0; i<v.size(); i++){
            // lengthen each line to the maxlength, and add to the full thing with a newline
            levelLine = (StringBuffer)v.elementAt(i);
            for (int j=levelLine.length(); j<maxLength; j++){
                levelLine.append(' ');
            }
            if (i < v.size()-1){ // put a new line char on all but the last line
                levelLine.append('\n');
            }            
            levelBuffer.append(levelLine);
        }
		//System.out.println("MaxLength = " + maxLength);
        return (levelBuffer.toString());
    }
    
    /** 
     * set the current level
     * 
     * @param level A string representing the level.
     */
    public void setLevel(String level){
        pause();
        this.level = level;
        ladderCanvas.setLevel(level);
        this.pack();
        startLevel();
    }
    
    /** 
     * Run the game
     * 
     * @param args 
     */
    public static void main(String args[]){
        Ladder ladder = new Ladder();
        ladder.setVisible(true);
        ladder.startLevel();
    }
    
    /** 
     * window deiconified
     * 
     * @param event window deiconified
     */
    public void windowDeiconified(java.awt.event.WindowEvent event){
	}
	
    /** 
     * window closed
     * 
     * @param event window closed
     */
    public void windowClosed(java.awt.event.WindowEvent event){
	}
	
    /** 
     * window opened
     * 
     * @param event window opened
     */
    public void windowOpened(java.awt.event.WindowEvent event){
	}
	
    /** 
     * window iconified
     * 
     * @param event window iconified
     */
    public void windowIconified(java.awt.event.WindowEvent event){
	}
    
    /** window closing
     * 
     * @param event window closing
     */
    public void windowClosing(java.awt.event.WindowEvent event){
        Object object = event.getSource();
        if (object == Ladder.this){
            exit();
        }
    }
	
    /** 
     * window activated
     * 
     * @param event window activated
     */
    public void windowActivated(java.awt.event.WindowEvent event){
        if (!pauseItem.getState()){
            unpause();
        }
    }
    
    /** 
     * window deactivated
     * 
     * @param event window deactivated
     */
    public void windowDeactivated(java.awt.event.WindowEvent event){
        pause();
    }
	
    /** item state changed
     * 
     * @param event item state changed
     */
    public void itemStateChanged(java.awt.event.ItemEvent event){
        Object object = event.getSource();
        if (object == pauseItem){
            if (pauseItem.getState()){
                if (ladderCanvas.ladderCanvasThread != null && ladderCanvas.ladderCanvasThread.isAlive()){
                    ladderCanvas.stop();
                }
            } else {
                if (ladderCanvas.ladderCanvasThread == null || !ladderCanvas.ladderCanvasThread.isAlive()){
        			ladderCanvas.start();
        		}
            }
        }
	}
    
    /** 
     * action performed
     * 
     * @param event action performed
     */
    public void actionPerformed(java.awt.event.ActionEvent event){
	    Color temp;
        Object object = event.getSource();
        //System.out.println("Some menu selected");
        if (object == exitItem){
            exit();
        } else if (object == bgItem){
		    temp = JColorChooser.showDialog(this, "Background Color", bgColor);
            if (temp != null){
			    bgColor = temp;
				ladderCanvas.setBGColor(bgColor);
				props.put("Background Color", ("" + bgColor.getRGB()));
			}            
        } else if (object == fgItem){
		    temp = JColorChooser.showDialog(this, "Background Color", bgColor);
            if (temp != null){
			    fgColor = temp;
				ladderCanvas.setFGColor(fgColor);
				props.put("Foreground Color", ("" + fgColor.getRGB()));
			}
        } else if (object == newItem){
            startGame();
        } else if (object == openItem){
            pause();
            FileDialog fd = new FileDialog(Ladder.this, "Open a Level", FileDialog.LOAD);
            fd.setFile("*.lvl");
            fd.setVisible(true);
            String s = fd.getFile();
            if (s != null){
                try {
                    changeLevel(loadLevelFromFile(s));        
                } catch (IOException e){
                } finally {
                    unpause();
                }
            } else {
                unpause();
            }
        } else if (object == easyItem){
           ladderCanvas.setDifficulty(LadderCanvas.EASY);
        } else if (object == mediumItem){
           ladderCanvas.setDifficulty(LadderCanvas.MEDIUM);
        } else if (object == hardItem){
           ladderCanvas.setDifficulty(LadderCanvas.HARD);
        } else if (object == veryHardItem){
           ladderCanvas.setDifficulty(LadderCanvas.VERY_HARD);
        } else if (object == impossibleItem){
           ladderCanvas.setDifficulty(LadderCanvas.IMPOSSIBLE);
        } else if (object == saveItem){
            pause();
            FileDialog fd = new FileDialog(Ladder.this, "Save a Level", FileDialog.SAVE);
            fd.setFile("*.lvl");
            fd.setVisible(true);
            if (fd.getFile() != null){
                try {
                    writeToFile(fd.getFile());
                } catch (IOException e){
                }
            }
        } else if (object == editItem){
           new Editor(level, Ladder.this);
		} else if (object == fontItem){
		    Integer i;
			i = (Integer)JOptionPane.showInputDialog(this, 
		        "Please pick a font size", "Font Size", JOptionPane.QUESTION_MESSAGE,
				null, FONT_SIZES, new Integer(ladderCanvas.getFontSize()));
			if (i!=null){
			    ladderCanvas.setFontSize(i.intValue());
				props.put("Font Size", ("" + i.intValue()));
				pack();
			}
        } else { 
		    for (int i = 0; i < LevelMenuItems.size(); i++){
                //System.out.println("Checking Menu " + i);
                if (object == (JRadioButtonMenuItem)LevelMenuItems.elementAt(i)){
                    //System.out.println("Found it! " + i);
                    changeLevel(nextLevel(i+1));
                }
            }
		}
    }

    /** 
     * write the current level to a file
     * 
     * @exception java.io.IOException an IOException occurs
     * @param fileName file name to write
     */
    private void writeToFile(String fileName)throws java.io.IOException{
        File f = new File(fileName);
        if (f.exists()){
            f.delete();
        }
        RandomAccessFile ra = new RandomAccessFile(f, "rw");
        ra.writeBytes(level);
        ra.close();
    }

    /** 
     * Set the score
     * 
     * @param s the current score
     */
    public void setScore(long s){
        scoreField.setText("Score     " + s);        
    }

    /** 
     * Set the number of lads
     * 
     * @param s current number of lads
     */
    public void setLads(int s){
        //System.out.println("Setting Lads: " + s);
        ladField.setText("Lads     " + s);        
    }

    /** 
     * set the level
     * 
     * @param s number of the level to set to
     */
    public void setLevel(int s){
        levelField.setText("Level     " + s);        
    }

    /** 
     * set the bonus time
     * 
     * @param s current bonus time
     */
    public void setBonusTime(int s){
        bonusTimeField.setText("Bonus time     " + s);        
    }

    /** 
     * change to the next level
     * 
     */
    public void changeLevel(){        
        level = nextLevel();
        ladderCanvas.setLevel(level);
        ladderCanvas.reset();
        this.pack();
        //System.out.println("Packed on change Level - Repaint");        
    }

    /** 
     * change to the specified level
     * 
     * @param level name of  the level to change to
     */
    public void changeLevel(String level){        
        this.level = level;
        ladderCanvas.setLevel(level);
        ladderCanvas.resetGame();
        this.pack();
		unpause();
        //System.out.println("Packed on change Level - Repaintt");
    }

    /** 
     * get the level after the specified level
     * 
     * @param ind number of the level
     * @return the text of the level
     */
    public String nextLevel(int ind){
        String s;
        currLevel = ind;
        try {
            s = loadLevelFromFile((String)LevelFiles.elementAt(currLevel-1));
            setLevel(currLevel);
			//System.out.println("Tried to select  level #" + (currLevel));
        } catch (IOException e){
            s = nextLevel();
        }
        return(s);
    }

    /** 
     * get the text of the next level
     * 
     * @return the text of the next level
     */
    public String nextLevel(){
        String s = "";
        int lev = currLevel;
        currLevel++;
        if (currLevel > LevelMenuItems.size()){
            currLevel = 1;
        }
        while (currLevel != lev){ // if we get around to the level we are on, just accept it.
            try {
                s = loadLevelFromFile((String)LevelFiles.elementAt(currLevel-1));
                levelGroup.setSelected(((JRadioButtonMenuItem)LevelMenuItems.elementAt(currLevel-1)).getModel(), true);
				//System.out.println("Tried to select next level #" + (currLevel));
        		setLevel(currLevel);
                return (s);
            } catch (IOException e){
            } 
            currLevel++;
            if (currLevel > LevelMenuItems.size()){
                currLevel = 1;
            }
        }
        setLevel(0); // didn't find a valid level
        return (s);
    }

    /** 
     * Start game at the current level.
     */
    public void startLevel(){
        pause();
        ladderCanvas.reset();
        unpause();
    }

    /** 
     * Start the game at the next level.
     */
    public void startGame(){
		changeLevel(nextLevel(1));
        unpause();
    }
        
    /** 
     * Pause the game.
     */
    private void pause(){
        pauseItem.setState(true);
        if (ladderCanvas.ladderCanvasThread != null && ladderCanvas.ladderCanvasThread.isAlive()){
            ladderCanvas.stop();
        }
    }
    
    /** 
     * Unpause the game.
     */
    private void unpause(){                   
        if (ladderCanvas.ladderCanvasThread == null || !ladderCanvas.ladderCanvasThread.isAlive()){
			ladderCanvas.start();
			pauseItem.setState(false);
		}
    }

    /** 
     * Load the properties file.
     */
    private void loadProperties(){
        defaultProps = new Properties();
        try{
			URL url = ClassLoader.getSystemResource("com/Ostermiller/Ladder/Ladder.ini");
			defaultProps.load(url.openStream());
        } catch (IOException e){
			System.out.println(ClassLoader.getSystemResource("com/Ostermiller/Ladder/Ladder.ini"));
			System.out.println("com.Ostermiller.Ladder.Ladder.ini not found");
        }
        props = new Properties(defaultProps);
        try{
			File propsFile = new File(System.getProperty("user.home"), ".java");
        	propsFile = new File(propsFile, "Ladder");
        	propsFile.mkdirs();
        	propsFile = new File(propsFile, "LadderUser.ini");
			FileInputStream fis = new FileInputStream(propsFile);
            props.load(fis);
            fis.close();
        } catch (IOException e){
        }
    }

    /** 
     * Store the properties file.
     * 
     */
    private void storeProperties(){
        // record the new window position
        Point p = getLocation();
        props.put("WindowX", ("" + p.x)); 
        props.put("WindowY", ("" + p.y));
        try{
			File propsFile = new File(System.getProperty("user.home"), ".java");
        	propsFile = new File(propsFile, "Ladder");
        	propsFile.mkdirs();
        	propsFile = new File(propsFile, "LadderUser.ini");
            FileOutputStream f = new FileOutputStream(propsFile);
            props.store(f, "User Preferences for Ladder");
            f.close();
        } catch (IOException e){
            System.out.println("Could not open LadderUser.ini");
        }
    }
    
    /** 
     * get a level from a file
     * 
     * @exception java.io.IOException 
     * @param fileName name of the file to load
     * @return the text of the level
     */
    private String loadLevelFromFile(String fileName) throws java.io.IOException {
    	InputStream f;
		String s1, s2;
        StringBuffer b = new StringBuffer();
		if (fileName.startsWith("com.Ostermiller.Ladder.")){
			// the file should be looked up in the classpath
			
			fileName = fileName.substring(23);
			URL url = ClassLoader.getSystemResource("com/Ostermiller/Ladder/"+fileName);
		    if (url != null){
				f = url.openStream();
			} else {
				throw new IOException ("com.Ostermiller.Ladder." + fileName +" not found.");
			}
		} else {
        	 f = new FileInputStream(fileName);
		}            
        int c = f.read();
        while (c != -1){
            b.append((char)c);
            c = f.read();
        }
        f.close();
        s1 = b.toString();
        s2 = neatenLevel(s1);
        // if the level and the neatened level are not the same, then save the neatened one.
        try{
            if (s1.compareTo(s2) != 0){
                System.out.println("Saving Neatened level");
                FileOutputStream ff = new FileOutputStream(fileName);
                ff.write(s2.getBytes());
                ff.close();
            }
        }catch(IOException e){
        }
        return (s2);
    }
    
    /** 
     * quit
     * 
     */
    private void exit(){
        setVisible(false);       // hide the Frame
        storeProperties(); // save the properties
        dispose();    // free the system resources
        System.exit(0); // close the application
    }
    
    /** Get the next color.
     * 
     * @param c a color
     * @return color after the one specified
     */
	public static Color nextColor(Color c){
		if (c.equals(Color.black)){
			return(Color.blue);
		} else if (c.equals( Color.blue)){
			return(Color.cyan);
		} else if (c.equals( Color.cyan)){
			return(Color.darkGray);
		} else if (c.equals( Color.darkGray)){
			return(Color.gray);
		} else if (c.equals( Color.gray)){
			return(Color.green);
		} else if (c.equals( Color.green)){
			return(Color.lightGray);
		} else if (c.equals( Color.lightGray)){
			return(Color.magenta);
		} else if (c.equals( Color.magenta)){
			return(Color.orange);
		} else if (c.equals( Color.orange)){
			return(Color.pink);
		} else if (c.equals( Color.pink)){
			return(Color.red);
		} else if (c.equals( Color.red)){
			return(Color.white);
		} else if (c.equals( Color.white)){
			return(Color.yellow);
		} else if (c.equals( Color.yellow)){
			return(Color.black);
		} else {
			return(Color.black);
		}
	}	
}
