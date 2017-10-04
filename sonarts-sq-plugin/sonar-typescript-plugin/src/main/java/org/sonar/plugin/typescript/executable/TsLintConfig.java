/*
 * SonarTS
 * Copyright (C) 2017-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.plugin.typescript.executable;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.sonar.plugin.typescript.rules.TypeScriptRule;

class TsLintConfig {

  private final JsonObject config;

  TsLintConfig() {
    config = new JsonObject();
    JsonArray extendz = new JsonArray();
    extendz.add("tslint-sonarts");
    config.add("extends", extendz);
    config.add("rules", new JsonObject());
  }

  void addRule(TypeScriptRule rule) {
    JsonObject rules = config.getAsJsonObject("rules");
    rules.add(rule.tsLintKey(), rule.configuration());
  }

  void save(Path configPath) {
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    try {
      Files.write(configPath, gson.toJson(config).getBytes(StandardCharsets.UTF_8));
    } catch (IOException e) {
      throw new IllegalStateException("Error saving tslint config.", e);
    }
  }
}
