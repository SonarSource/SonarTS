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
package org.sonar.plugin.typescript.rules;

import com.google.gson.Gson;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class MccabeComplexityTest {

  @Test
  public void default_configuration() throws Exception {
    MccabeComplexity cyclomaticComplexity = new MccabeComplexity();
    cyclomaticComplexity.enable();
    String configuration = new Gson().toJson(cyclomaticComplexity.configuration());
    assertThat(configuration).isEqualTo("[10]");
  }

  @Test
  public void custom_configuration() throws Exception {
    MccabeComplexity cyclomaticComplexity = new MccabeComplexity();
    cyclomaticComplexity.enable();
    cyclomaticComplexity.threshold = 5;
    String configuration = new Gson().toJson(cyclomaticComplexity.configuration());
    assertThat(configuration).isEqualTo("[5]");
  }
}
