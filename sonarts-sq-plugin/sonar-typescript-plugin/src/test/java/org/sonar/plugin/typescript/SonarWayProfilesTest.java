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

import java.util.Set;
import java.util.stream.Collectors;
import org.junit.Test;
import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition.BuiltInActiveRule;
import org.sonar.api.server.profile.BuiltInQualityProfilesDefinition.BuiltInQualityProfile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.sonar.api.server.profile.BuiltInQualityProfilesDefinition.Context;

public class SonarWayProfilesTest {

  private static final String REPO_KEY_PROPERTY = "repoKey";
  private static final String RULE_KEY_PROPERTY = "ruleKey";

  @Test
  public void should_create_sonar_way_profile() {
    SonarWayProfile definition = new SonarWayProfile();
    Context context = new Context();
    definition.define(context);

    BuiltInQualityProfile profile = context.profile("ts", SonarWayProfile.PROFILE_NAME);


    assertThat(profile.language()).isEqualTo(TypeScriptLanguage.KEY);
    assertThat(profile.name()).isEqualTo(SonarWayProfile.PROFILE_NAME);
    assertThat(profile.rules()).extracting(REPO_KEY_PROPERTY).containsOnly(TypeScriptRulesDefinition.REPOSITORY_KEY);
    assertThat(profile.rules()).extracting(RULE_KEY_PROPERTY).contains("S3923");
    assertThat(profile.rules()).extracting(RULE_KEY_PROPERTY).doesNotContain("S3801");
  }

  @Test
  public void should_create_sonar_way_recommended_profile() {
    SonarWayRecommendedProfile definition = new SonarWayRecommendedProfile();
    Context context = new Context();
    definition.define(context);

    BuiltInQualityProfile profile = context.profile("ts", SonarWayRecommendedProfile.PROFILE_NAME);

    assertThat(profile.language()).isEqualTo(TypeScriptLanguage.KEY);
    assertThat(profile.name()).isEqualTo(SonarWayRecommendedProfile.PROFILE_NAME);
    assertThat(profile.rules()).extracting(REPO_KEY_PROPERTY).containsOnly(TypeScriptRulesDefinition.REPOSITORY_KEY);
    assertThat(profile.rules()).extracting(RULE_KEY_PROPERTY).contains("S3353");
    assertThat(profile.rules()).extracting(RULE_KEY_PROPERTY).doesNotContain("S1541");
  }

  @Test
  public void test_recommended_contains_all_default_rules() throws Exception {
    Context context = new Context();
    new SonarWayRecommendedProfile().define(context);
    BuiltInQualityProfile recommendedProfile = context.profile("ts", SonarWayRecommendedProfile.PROFILE_NAME);

    new SonarWayProfile().define(context);
    BuiltInQualityProfile defaultProfile = context.profile("ts", SonarWayProfile.PROFILE_NAME);

    Set<String> defaultProfileRules = defaultProfile.rules().stream().map(BuiltInActiveRule::ruleKey).collect(Collectors.toSet());
    Set<String> recommendedProfileRules = recommendedProfile.rules().stream().map(BuiltInActiveRule::ruleKey).collect(Collectors.toSet());

    assertThat(recommendedProfileRules).containsAll(defaultProfileRules);
  }
}
