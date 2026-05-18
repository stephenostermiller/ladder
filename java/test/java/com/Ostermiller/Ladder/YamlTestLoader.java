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

import org.yaml.snakeyaml.Yaml;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

public class YamlTestLoader {
	private static final Yaml yaml = new Yaml();

	public static YamlTestData loadTest(String filename) throws IOException {
		Path testDir = findTestsDirectory();
		Path testFile = testDir.resolve(filename);

		try (InputStream input = new FileInputStream(testFile.toFile())) {
			Map<String, Object> data = yaml.load(input);
			return mapToTestData(data);
		}
	}

	private static Path findTestsDirectory() {
		Path cwd = Paths.get(System.getProperty("user.dir"));
		if (Files.exists(cwd.resolve("tests"))) {
			return cwd.resolve("tests");
		}
		if (Files.exists(cwd.getParent().resolve("tests"))) {
			return cwd.getParent().resolve("tests");
		}
		throw new IllegalArgumentException("Could not find tests directory");
	}

	public static List<String> listTestFiles() throws IOException {
		Path testDir = Paths.get("tests");
		if (!Files.exists(testDir)) {
			return Collections.emptyList();
		}

		try (java.util.stream.Stream<Path> stream = Files.list(testDir)) {
			return stream
				.filter(p -> p.toString().endsWith(".yaml"))
				.map(p -> p.getFileName().toString())
				.sorted()
				.collect(Collectors.toList());
		}
	}

	private static YamlTestData mapToTestData(Map<String, Object> map) {
		YamlTestData data = new YamlTestData();
		data.name = (String) map.get("name");
		data.level = (String) map.get("level");
		data.producer = (Map<String, Object>) map.get("producer");
		data.direction = (Map<String, Object>) map.get("direction");
		data.initialCheck = (Map<String, Object>) map.get("initialCheck");

		List<Map<String, Object>> steps = (List<Map<String, Object>>) map.get("steps");
		if (steps != null) {
			data.steps = steps;
		} else {
			data.steps = new ArrayList<>();
		}

		return data;
	}

	public static Random createRng(String type, Map<String, Object> params) {
		if (type == null) {
			return null;
		}

		switch (type) {
			case "DeterministicBarrelProducerRandom":
				Integer barrelInterval = null;
				if (params != null && params.containsKey("barrelInterval")) {
					barrelInterval = ((Number) params.get("barrelInterval")).intValue();
				}
				return new DeterministicBarrelProducerRandom(barrelInterval);
			case "CyclingBarrelRandom":
				return new CyclingBarrelRandom();
			default:
				throw new IllegalArgumentException("Unknown RNG type: " + type);
		}
	}
}
