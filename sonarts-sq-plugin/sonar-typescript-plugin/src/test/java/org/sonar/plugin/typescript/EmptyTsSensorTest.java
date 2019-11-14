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

import java.io.File;
import org.junit.Test;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;

import static org.assertj.core.api.Assertions.assertThat;

public class EmptyTsSensorTest {

  @org.junit.Rule
  public LogTester logTester = new LogTester();

  @Test
  public void descriptor() {
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    new EmptyTsSensor().describe(sensorDescriptor);

    assertThat(sensorDescriptor.languages()).containsExactly("ts");
    assertThat(sensorDescriptor.name()).isEqualTo("SonarTS");
  }

  @Test
  public void log_message() {
    new EmptyTsSensor().execute(SensorContextTester.create(new File("")));
    assertThat(logTester.logs(LoggerLevel.INFO))
      .containsExactly("Since SonarTS v2.0 TypeScript analysis is performed by SonarJS analyzer v6.0 or later. No TypeScript analysis is performed by SonarTS.");
  }
}
