/*
 * SonarTS
 * Copyright (C) 2017-2019 SonarSource SA
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
package org.sonar.plugin.typescript.rules;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;

public abstract class TypeScriptRule {

  private boolean enabled;

  public JsonElement configuration() {
    return ruleConfiguration();
  }

  public void enable() {
    enabled = true;
  }

  public boolean isEnabled() {
    return enabled;
  }

  public abstract String tsLintKey();

  JsonArray ruleConfiguration(Object... params) {
    JsonArray configuration = new JsonArray();
    for (Object param : params) {
      if (param instanceof Number) {
        configuration.add((Number) param);
      } else if (param instanceof Boolean) {
        configuration.add((Boolean) param);
      } else if (param instanceof Character) {
        configuration.add((Character) param);
      } else if (param instanceof String) {
        configuration.add((String) param);
      } else if (param instanceof JsonElement) {
        configuration.add((JsonElement) param);
      } else {
        throw new IllegalArgumentException("Invalid parameter for configuration " + param);
      }
    }
    return configuration;
  }

}
