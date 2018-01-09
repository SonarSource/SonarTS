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
package org.sonar.plugin.typescript;

import org.sonar.api.Plugin;
import org.sonar.api.config.PropertyDefinition;
import org.sonar.api.resources.Qualifiers;
import org.sonar.plugin.typescript.executable.SonarTSCoreBundleFactory;
import org.sonar.plugin.typescript.lcov.LCOVCoverageSensor;

public class TypeScriptPlugin implements Plugin {
  private static final String TESTS_AND_COVERAGE_SUBCATEGORY = "Tests and Coverage";
  private static final String TYPESCRIPT_CATEGORY = "TypeScript";
  private static final String GENERAL_SUBCATEGORY = "General";

  static final String FILE_SUFFIXES_KEY = "sonar.typescript.file.suffixes";
  private static final String FILE_SUFFIXES_DEFVALUE = ".ts,.tsx";

  public static final String LCOV_REPORT_PATHS = "sonar.typescript.lcov.reportPaths";
  public static final String LCOV_REPORT_PATHS_DEFAULT_VALUE = "";

  public static final String NODE_EXECUTABLE = "sonar.typescript.node";
  public static final String NODE_EXECUTABLE_DEFAULT = "node";

  public static final String TS_EXCLUSIONS_KEY = "sonar.typescript.exclusions";
  public static final String TS_EXCLUSIONS_DEFAULT_VALUE = "**/node_modules/**,**/bower_components/**";

  @Override
  public void define(Context context) {
    context.addExtensions(
      new SonarTSCoreBundleFactory(/* absolute location inside jar */ "/sonarts-bundle.zip"),
      ExternalProcessErrorConsumer.class,
      TypeScriptLanguage.class,
      ExternalTypescriptSensor.class,
      SonarWayProfile.class,
      SonarWayRecommendedProfile.class,
      TypeScriptRulesDefinition.class,
      LCOVCoverageSensor.class,
      TypeScriptExclusionsFileFilter.class,
      ContextualSensor.class,
      ContextualSensor.class,
      PropertyDefinition.builder(FILE_SUFFIXES_KEY)
        .defaultValue(FILE_SUFFIXES_DEFVALUE)
        .name("File Suffixes")
        .description("Comma-separated list of suffixes for files to analyze.")
        .subCategory(GENERAL_SUBCATEGORY)
        .category(TYPESCRIPT_CATEGORY)
        .onQualifiers(Qualifiers.PROJECT)
        .multiValues(true)
        .build(),
      PropertyDefinition.builder(LCOV_REPORT_PATHS)
        .defaultValue(LCOV_REPORT_PATHS_DEFAULT_VALUE)
        .name("LCOV Files")
        .description("Paths (absolute or relative) to the files with LCOV data.")
        .onQualifiers(Qualifiers.MODULE, Qualifiers.PROJECT)
        .subCategory(TESTS_AND_COVERAGE_SUBCATEGORY)
        .category(TYPESCRIPT_CATEGORY)
        .multiValues(true)
        .build(),
      PropertyDefinition.builder(NODE_EXECUTABLE)
        .defaultValue(NODE_EXECUTABLE_DEFAULT)
        .name("Node.js executable")
        .description("Node.js executable used to run the analysis.")
        .subCategory(GENERAL_SUBCATEGORY)
        .category(TYPESCRIPT_CATEGORY)
        .onQualifiers(Qualifiers.PROJECT)
        .build(),
      PropertyDefinition.builder(TS_EXCLUSIONS_KEY)
        .defaultValue(TS_EXCLUSIONS_DEFAULT_VALUE)
        .name("TypeScript Exclusions")
        .description("List of file path patterns to be excluded from analysis of TypeScript files.")
        .onQualifiers(Qualifiers.MODULE, Qualifiers.PROJECT)
        .subCategory(GENERAL_SUBCATEGORY)
        .multiValues(true)
        .category(TYPESCRIPT_CATEGORY)
        .build()
    );
  }
}
