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
package org.sonar.plugin.typescript.executable;

import java.io.File;
import org.sonar.api.batch.InstantiationStrategy;
import org.sonar.api.config.Configuration;
import org.sonarsource.api.sonarlint.SonarLintSide;

// FIXME Once there is a proper way not using @InstantiationStrategy we can revert to a single extension
@InstantiationStrategy("PER_PROCESS")
@SonarLintSide
public class SonarLintTSCoreBundleFactory implements ExecutableBundleFactory {

  private String bundleLocation;

  public SonarLintTSCoreBundleFactory(String bundleLocation) {
    this.bundleLocation = bundleLocation;
  }

  @Override
  public SonarTSCoreBundle createAndDeploy(File deployDestination, Configuration configuration) {
    return SonarTSCoreBundle.createAndDeploy(bundleLocation, deployDestination, configuration);
  }
}
