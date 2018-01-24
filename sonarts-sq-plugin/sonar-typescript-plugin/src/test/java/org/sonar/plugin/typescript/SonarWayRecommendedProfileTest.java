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
import org.sonar.api.profiles.RulesProfile;
import org.sonar.api.rules.RuleFinder;
import org.sonar.api.utils.ValidationMessages;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.plugin.typescript.SonarWayProfileTest.ruleFinder;

public class SonarWayRecommendedProfileTest {

  @Test
  public void should_create_sonar_way_recommended_profile() {
    ValidationMessages validation = ValidationMessages.create();

    RuleFinder ruleFinder = ruleFinder();
    SonarWayRecommendedProfile definition = new SonarWayRecommendedProfile(ruleFinder);
    RulesProfile profile = definition.createProfile(validation);

    assertThat(profile.getLanguage()).isEqualTo(TypeScriptLanguage.KEY);
    assertThat(profile.getName()).isEqualTo(SonarWayRecommendedProfile.PROFILE_NAME);
    assertThat(profile.getActiveRules()).extracting("repositoryKey").containsOnly("typescript", TypeScriptRulesDefinition.REPOSITORY_KEY);
    assertThat(validation.hasErrors()).isFalse();
  }

}
