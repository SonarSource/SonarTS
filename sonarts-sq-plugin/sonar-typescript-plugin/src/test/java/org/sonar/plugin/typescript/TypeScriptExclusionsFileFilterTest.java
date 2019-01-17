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
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.config.internal.MapSettings;

import static org.assertj.core.api.Assertions.assertThat;

public class TypeScriptExclusionsFileFilterTest {

  @Test
  public void should_exclude_node_modules() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TS_EXCLUSIONS_KEY, TypeScriptPlugin.TS_EXCLUSIONS_DEFAULT_VALUE);
    TypeScriptExclusionsFileFilter filter = new TypeScriptExclusionsFileFilter(settings.asConfig());
    assertThat(filter.accept(inputFile("some_app.ts"))).isTrue();
    assertThat(filter.accept(inputFile("node_modules/some_lib.ts"))).isFalse();
    assertThat(filter.accept(inputFile("node_modules/my_lib_folder/my_lib.ts"))).isFalse();
    assertThat(filter.accept(inputFile("sub_module/node_modules/submodule_lib.ts"))).isFalse();
    assertThat(filter.accept(inputFile("sub_module2/bower_components/bower_lib/lib.ts"))).isFalse();
  }

  @Test
  public void should_include_node_modules_when_property_is_overridden() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TS_EXCLUSIONS_KEY, "");

    TypeScriptExclusionsFileFilter filter = new TypeScriptExclusionsFileFilter(settings.asConfig());

    assertThat(filter.accept(inputFile("some_app.ts"))).isTrue();
    assertThat(filter.accept(inputFile("node_modules/some_lib.ts"))).isTrue();
    assertThat(filter.accept(inputFile("sub_module2/bower_components/some_lib.ts"))).isTrue();
  }

  @Test
  public void should_exclude_using_custom_path_regex() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(
      TypeScriptPlugin.TS_EXCLUSIONS_KEY, TypeScriptPlugin.TS_EXCLUSIONS_DEFAULT_VALUE + "," + "**/libs/**");

    TypeScriptExclusionsFileFilter filter = new TypeScriptExclusionsFileFilter(settings.asConfig());

    assertThat(filter.accept(inputFile("some_app.ts"))).isTrue();
    assertThat(filter.accept(inputFile("node_modules/some_lib.ts"))).isFalse();
    assertThat(filter.accept(inputFile("libs/some_lib.ts"))).isFalse();
  }

  @Test
  public void should_ignore_empty_path_regex() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TS_EXCLUSIONS_KEY, "," + TypeScriptPlugin.TS_EXCLUSIONS_DEFAULT_VALUE + ",");

    TypeScriptExclusionsFileFilter filter = new TypeScriptExclusionsFileFilter(settings.asConfig());

    assertThat(filter.accept(inputFile("some_app.ts"))).isTrue();
    assertThat(filter.accept(inputFile("node_modules/some_lib.ts"))).isFalse();
  }
  
  @Test
  public void should_accept_not_typescript_files() throws Exception {
    MapSettings settings = new MapSettings();
    settings.setProperty(TypeScriptPlugin.TS_EXCLUSIONS_KEY, "," + TypeScriptPlugin.TS_EXCLUSIONS_DEFAULT_VALUE + ",");

    TypeScriptExclusionsFileFilter filter = new TypeScriptExclusionsFileFilter(settings.asConfig());
    assertThat(filter.accept(javascriptInputFile("node_modules/some_lib.js"))).isTrue();
  }

  private static DefaultInputFile inputFile(String file) {
    return new TestInputFileBuilder("test","test_node_modules/" + file).setLanguage("ts").build();
  }

  private static DefaultInputFile javascriptInputFile(String file) {
    return new TestInputFileBuilder("test","test_node_modules/" + file).setLanguage("js").build();
  }

}
