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
package org.sonar.plugin.typescript;

import org.junit.Test;
import org.sonar.api.config.internal.MapSettings;

import static org.assertj.core.api.Assertions.assertThat;

public class TypeScriptLanguageTest {

  @Test
  public void should_have_correct_file_extensions() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.FILE_SUFFIXES_KEY, TypeScriptPlugin.FILE_SUFFIXES_DEFVALUE);
    TypeScriptLanguage typeScriptLanguage = new TypeScriptLanguage(settings.asConfig());
    assertThat(typeScriptLanguage.getFileSuffixes()).containsExactly(".ts", ".tsx");
  }
}
