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
package org.sonar.plugin.typescript.executable;

import java.io.File;
import java.io.InputStream;
import org.sonar.api.batch.BatchSide;
import org.sonar.api.batch.ScannerSide;
import org.sonar.api.config.Configuration;
import org.sonar.api.utils.log.Logger;
import org.sonar.api.utils.log.Loggers;
import org.sonarsource.api.sonarlint.SonarLintSide;

import static org.sonarsource.api.sonarlint.SonarLintSide.MULTIPLE_ANALYSES;

@BatchSide
@ScannerSide
@SonarLintSide(lifespan = MULTIPLE_ANALYSES)
public class SonarTSCoreBundleFactory implements ExecutableBundleFactory {

  private static final Logger LOG = Loggers.get(SonarTSCoreBundleFactory.class);

  private String bundleLocation;

  public SonarTSCoreBundleFactory(String bundleLocation) {
    this.bundleLocation = bundleLocation;
  }

  /**
   * Extracting "sonarts-core.zip" (containing tslint and tslint-sonarts)
   * to deployDestination (".sonar" directory of the analyzed project).
   */
  @Override
  public SonarTSCoreBundle createAndDeploy(File deployDestination, Configuration configuration) {
    InputStream bundle = getClass().getResourceAsStream(bundleLocation);
    if (bundle == null) {
      throw new IllegalStateException("SonarTS bundle not found at " + bundleLocation);
    }
    try {
      LOG.debug("Deploying bundle to {}", deployDestination.getAbsolutePath());
      Zip.extract(bundle, deployDestination);
      return new SonarTSCoreBundle(new File(deployDestination, "sonarts-bundle"), configuration);
    } catch (Exception e) {
      throw new IllegalStateException("Failed to deploy SonarTS bundle (with classpath '" + bundleLocation + "')", e);
    }
  }

}
