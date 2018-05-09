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
import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition.BuiltInQualityProfile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.api.server.profile.BuiltInQualityProfilesDefinition.Context;

public class SonarWayProfileTest {

  @Test
  public void should_create_sonar_way_profile() {
    SonarWayProfile definition = new SonarWayProfile();
    Context context = new Context();
    definition.define(context);

    BuiltInQualityProfile profile = context.profile("ts", SonarWayProfile.PROFILE_NAME);

    assertThat(profile.language()).isEqualTo(TypeScriptLanguage.KEY);
    assertThat(profile.name()).isEqualTo(SonarWayProfile.PROFILE_NAME);
    assertThat(profile.rules()).extracting("repoKey").containsOnly(TypeScriptRulesDefinition.REPOSITORY_KEY);
    assertThat(profile.rules()).extracting("ruleKey").contains("S3923");
    assertThat(profile.rules()).extracting("ruleKey").doesNotContain("S3801");
  }
}
