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

import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition;
import org.sonarsource.analyzer.commons.BuiltInQualityProfileJsonLoader;

public class SonarWayProfile implements BuiltInQualityProfilesDefinition {

  public static final String PROFILE_NAME = "Sonar way";
  private static final String PROFILE_PATH = "org/sonar/l10n/typescript/rules/typescript/Sonar_way_profile.json";

  @Override
  public void define(Context context) {
    NewBuiltInQualityProfile profile = context.createBuiltInQualityProfile(PROFILE_NAME, TypeScriptLanguage.KEY);
    BuiltInQualityProfileJsonLoader.load(profile, TypeScriptRulesDefinition.REPOSITORY_KEY, PROFILE_PATH);
    profile.done();
  }
}
