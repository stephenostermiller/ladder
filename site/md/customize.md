---
title: Customize Ladder
description: Tips and tricks that let you shape the game to your liking.
keywords: customize ladder, ladder customization, hacking ladder, modify ladder
---

## Creating Levels

Ladder comes with a level editor and you can create new levels ([instructions](levels.html)).

## LadderUser.ini

The Java version of Ladder creates a user configuration file called
`<UserHome>/.java/Ladder/LadderUser.ini`.

`<UserHome>` is your home directory, often `c:\Windows` on Win9x systems, and `c:\Documents and Settings\<UserName>` on other Windows computers. You can hack Ladder by adding content to this file. Values that are in this file override the values from the default configuration file.

### Add your levels to the game play and menus {#addlevel}

Levels are taken from values that look like:

```
Level<#>=<File Name>
Level1<#>Name=<Name>
```

If you want to add a level, add the line:

```
Level15=C:\My Documents\NewLevel.lvl
Level15Name=My New Level
```

Capitalization matters here.

If you modified Easy Street and want to use your version, add the line:

```
Level1=C:\My Documents\MyEasyStreet.lvl
```

If you want to replace all the levels with your own, make the file name of the last one blank:

```
Level1=C:\My Documents\MyFirst.lvl
Level1Name=My First Level
Level2=C:\My Documents\MySecond.lvl
Level2Name=My Second Level
Level3=C:\My Documents\MyThird.lvl
Level3Name=My Third Level
Level4=
Level4Name=
```
