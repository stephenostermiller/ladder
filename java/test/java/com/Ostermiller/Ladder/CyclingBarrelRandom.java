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

import java.util.Random;

public class CyclingBarrelRandom extends Random {
	public int leftRightCount = 0;
	public int leftRightDownCount = 0;

	@Override
	public int nextInt(int bound) {
		if (bound == Barrel.LEFT_RIGHT_DECISIONS.length) {
			return leftRightCount++ % bound;
		} else if (bound == Barrel.LEFT_RIGHT_DOWN_DECISIONS.length) {
			return leftRightDownCount++ % bound;
		}
		throw new UnsupportedOperationException("Unexpected random bound: " + bound);
	}
}
