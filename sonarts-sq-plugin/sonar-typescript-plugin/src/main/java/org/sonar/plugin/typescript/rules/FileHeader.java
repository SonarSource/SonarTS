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

import com.google.gson.JsonElement;
import org.sonar.check.Rule;
import org.sonar.check.RuleProperty;

@Rule(key = "S1451")
public class FileHeader extends TypeScriptRule {

  @RuleProperty(
    key = "headerFormat",
    description = "Regular expression used to verify expected copyright and license header (without comment symbols). " +
      "E.g. set '\\s*COPYRIGHT\\s20\\d{2}' to match header '// COPYRIGHT 2018'.",
    defaultValue = "")
  String headerFormat = "";

  @Override
  public JsonElement configuration() {
    return ruleConfiguration(headerFormat);
  }

  @Override
  public String tsLintKey() {
    return "file-header";
  }
}
