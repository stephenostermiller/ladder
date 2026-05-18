/*
 * Part of Ladder, a game.
 * Copyright (C) 2026
 * Stephen Ostermiller http://ostermiller.org/contact.pl?regarding=Ladder
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

public class YamlTestData {
	public String name;
	public String level;
	public Map<String, Object> producer;
	public Map<String, Object> direction;
	public Map<String, Object> initialCheck;
	public List<Map<String, Object>> steps;

	public static class RngConfig {
		public String type;
		public Map<String, Object> params;

		public RngConfig(Map<String, Object> map) {
			this.type = (String) map.get("type");
			this.params = (Map<String, Object>) map.get("params");
		}
	}

	public static class StepData {
		public String action = "step";
		public String command = "NONE";
		public Integer frames = 1;
		public String assertScreen;
		public String assertGameOver;
		public Map<String, Object> checkDirection;
		public Boolean checkScore;
		public Integer checkCycles;

		public StepData(Map<String, Object> map) {
			if (map.containsKey("action")) {
				this.action = (String) map.get("action");
			}
			if (map.containsKey("command")) {
				this.command = (String) map.get("command");
			}
			if (map.containsKey("frames")) {
				this.frames = ((Number) map.get("frames")).intValue();
			}
			if (map.containsKey("assertScreen")) {
				this.assertScreen = (String) map.get("assertScreen");
			}
			if (map.containsKey("assertGameOver")) {
				this.assertGameOver = (String) map.get("assertGameOver");
			}
			if (map.containsKey("checkDirection")) {
				this.checkDirection = (Map<String, Object>) map.get("checkDirection");
			}
			if (map.containsKey("checkScore")) {
				this.checkScore = (Boolean) map.get("checkScore");
			}
			if (map.containsKey("checkCycles")) {
				Object val = map.get("checkCycles");
				if (val instanceof Number) {
					this.checkCycles = ((Number) val).intValue();
				}
			}
		}
	}
}
