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
package org.sonar.plugin.typescript;

import org.sonar.api.Plugin;
import org.sonar.api.SonarProduct;
import org.sonar.plugin.typescript.executable.SonarTSCoreBundleFactory;

public class TypeScriptPlugin implements Plugin {
  /* absolute location inside jar */
  private static final String SONARTS_BUNDLE_ZIP = "/sonarts-bundle.zip";

  static final String FILE_SUFFIXES_KEY = "sonar.typescript.file.suffixes";
  public static final String FILE_SUFFIXES_DEFVALUE = ".ts,.tsx";

  public static final String TSCONFIG_PATH = "sonar.typescript.tsconfigPath";


  public static final String NODE_EXECUTABLE = "sonar.typescript.node";
  public static final String NODE_EXECUTABLE_DEFAULT = "node";

  public static final String TS_EXCLUSIONS_KEY = "sonar.typescript.exclusions";
  public static final String TS_EXCLUSIONS_DEFAULT_VALUE = "**/node_modules/**,**/bower_components/**";

  @Override
  public void define(Context context) {
    context.addExtensions(
      ExternalProcessStreamConsumer.class,
      TypeScriptRulesDefinition.class,
      TypeScriptExclusionsFileFilter.class,
      new SonarTSCoreBundleFactory(SONARTS_BUNDLE_ZIP)
    );

    if (context.getRuntime().getProduct().equals(SonarProduct.SONARLINT)) {
      context.addExtension(ContextualSensor.class);
      context.addExtension(ContextualServer.class);
    } else {
      context.addExtension(ExternalTypescriptSensor.class);
    }

  }
}
