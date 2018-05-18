/*
 * SonarTS
 * Copyright (C) 2017-2018 SonarSource SA
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

import com.google.gson.JsonElement;
import org.sonar.check.Rule;
import org.sonar.check.RuleProperty;

@Rule(key = "S4622")
public class MaxUnionSize extends TypeScriptRule {

  private static final int DEFAULT_MAX = 3;

  @RuleProperty(
    key = "max",
    description = "Maximum elements authorized in a union type definition.",
    defaultValue = "" + DEFAULT_MAX)
  int max = DEFAULT_MAX;

  @Override
  public JsonElement configuration() {
    return ruleConfiguration(max);
  }

  @Override
  public String tsLintKey() {
    return "max-union-size";
  }
}
