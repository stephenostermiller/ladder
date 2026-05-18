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

public class DeterministicBarrelProducerRandom extends Random {
	private int callCount = 0;
	private int barrelInterval;

	public DeterministicBarrelProducerRandom(int barrelInterval) {
		this.barrelInterval = barrelInterval;
	}

	@Override
	public double nextDouble() {
		int frame = callCount++;
		if (frame % barrelInterval == 0) {
			return 0.0;
		}
		return 1.0;
	}
}
