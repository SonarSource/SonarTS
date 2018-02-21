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

import java.net.URI;
import org.junit.Rule;
import org.junit.Test;
import org.sonar.api.batch.fs.InputFile.Type;
import org.sonar.api.batch.fs.internal.DefaultInputFile;
import org.sonar.api.batch.fs.internal.TestInputFileBuilder;
import org.sonar.api.batch.sensor.SensorContext;
import org.sonar.api.batch.sensor.internal.DefaultSensorDescriptor;
import org.sonar.api.batch.sensor.internal.SensorContextTester;
import org.sonar.api.utils.internal.JUnitTempFolder;
import org.sonar.api.utils.log.LogTester;
import org.sonar.api.utils.log.LoggerLevel;
import org.sonar.plugin.typescript.SensorContextUtils.AnalysisResponse;
import org.sonar.plugin.typescript.SensorContextUtils.Issue;
import org.sonar.plugin.typescript.SensorContextUtils.Position;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.sonar.plugin.typescript.TestUtils.BASE_DIR;
import static org.sonar.plugin.typescript.TestUtils.CHECK_FACTORY;
import static org.sonar.plugin.typescript.TestUtils.createInputFile;

public class ContextualSensorTest {

  @org.junit.Rule
  public JUnitTempFolder temp = new JUnitTempFolder();

  @Rule
  public final LogTester logTester = new LogTester();

  @Test
  public void should_save_issues() throws Exception {
    SensorContextTester sensorContext = SensorContextTester.create(BASE_DIR);
    DefaultInputFile inputFile = createInputFile(sensorContext, "function foo(){}", "foo/file.ts");

    ContextualServer contextualServer = mock(ContextualServer.class);
    AnalysisResponse mockedResponse = new AnalysisResponse();
    mockedResponse.issues = new Issue[1];
    Issue issue = new Issue();
    issue.failure = "message";
    issue.ruleName = "no-unconditional-jump";
    issue.startPosition = new Position(0, 5);
    issue.endPosition = new Position(0, 6);
    issue.name = inputFile.absolutePath();
    mockedResponse.issues[0] = issue;

    when(contextualServer.isAlive()).thenReturn(true);
    when(contextualServer.analyze(any())).thenReturn(mockedResponse);

    ContextualSensor contextualSensor = new ContextualSensor(CHECK_FACTORY, contextualServer);
    contextualSensor.execute(sensorContext);
    assertThat(sensorContext.allIssues()).hasSize(1);
  }


  @Test
  public void should_not_execute_if_not_file_uri() throws Exception {
    SensorContextTester sensorContext = SensorContextTester.create(BASE_DIR);

    DefaultInputFile testInputFile = new TestInputFileBuilder("moduleKey", "foo/file.ts")
      .setLanguage(TypeScriptLanguage.KEY)
      .build();

    DefaultInputFile spiedInputFile = spy(testInputFile);
    when(spiedInputFile.uri()).thenReturn(new URI("https://example.org/foo/file.ts"));
    sensorContext.fileSystem().add(spiedInputFile);

    ContextualServer contextualServer = mock(ContextualServer.class);
    when(contextualServer.isAlive()).thenReturn(true);
    verify(contextualServer, never()).analyze(any());

    ContextualSensor contextualSensor = new ContextualSensor(CHECK_FACTORY, contextualServer);
    contextualSensor.execute(sensorContext);
    assertThat(sensorContext.allIssues()).hasSize(0);

    assertThat(logTester.logs()).contains("File with uri [https://example.org/foo/file.ts] can not be analyzed as it's not file scheme.");
  }

  @Test
  public void should_not_analyze_when_server_not_alive() throws Exception {
    ContextualServer contextualServer = mock(ContextualServer.class);
    when(contextualServer.isAlive()).thenReturn(false);
    verify(contextualServer, never()).analyze(any());

    ContextualSensor contextualSensor = new ContextualSensor(CHECK_FACTORY, contextualServer);
    contextualSensor.execute(mock(SensorContext.class));

    assertThat(logTester.logs(LoggerLevel.WARN)).contains("Skipped analysis as SonarTS Server is not running");
  }

  @Test
  public void should_have_description() throws Exception {
    ContextualSensor sensor = new ContextualSensor(CHECK_FACTORY,  mock(ContextualServer.class));
    DefaultSensorDescriptor sensorDescriptor = new DefaultSensorDescriptor();
    sensor.describe(sensorDescriptor);
    assertThat(sensorDescriptor.name()).isEqualTo("Contextual SonarTS");
    assertThat(sensorDescriptor.languages()).containsOnly("ts");
    assertThat(sensorDescriptor.type()).isEqualTo(Type.MAIN);
  }
}

