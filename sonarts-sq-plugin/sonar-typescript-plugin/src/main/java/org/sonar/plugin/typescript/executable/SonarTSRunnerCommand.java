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

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.StreamSupport;
import org.sonar.api.batch.fs.InputFile;

public class SonarTSRunnerCommand {
  private final List<String> commandLineTokens;
  private final Iterable<InputFile> files;
  private String tsconfig;
  private List<RuleToExecute> rules = new ArrayList<>();

  public SonarTSRunnerCommand(Iterable<InputFile> files, String... commandLineTokens) {
    this.files = files;
    this.commandLineTokens = Arrays.asList(commandLineTokens);
  }

  public String commandLine() {
    return String.join(" ", commandLineTokens);
  }

  public List<String> commandLineTokens() {
    List<String> list = new ArrayList<>();
    list.addAll(commandLineTokens);
    return list;
  }

  public String toJsonRequest() {
    String[] filepaths = StreamSupport.stream(files.spliterator(), false).map(InputFile::absolutePath).toArray(String[]::new);
    SonarTSRequest requestToRunner = new SonarTSRequest(filepaths);
    if (tsconfig != null) {
      requestToRunner.tsconfig = this.tsconfig;
      rules.forEach(rule -> requestToRunner.rules.add(rule));
    }
    return new Gson().toJson(requestToRunner);
  }

  public void setTsConfigPath(String tsconfig) {
    this.tsconfig = tsconfig;
  }

  public void addRule(String ruleKey, JsonElement configuration) {
    this.rules.add(new RuleToExecute(ruleKey, configuration));
  }

  private static class SonarTSRequest {
    final String[] filepaths;
    String tsconfig;
    List<RuleToExecute> rules = new ArrayList<>();

    SonarTSRequest(String[] filepaths) {
      this.filepaths = filepaths;
    }
  }

  private class RuleToExecute {
    final String ruleName;
    final JsonElement ruleArguments;

    public RuleToExecute(String ruleName, JsonElement ruleArguments) {
      this.ruleName = ruleName;
      this.ruleArguments = ruleArguments;
    }
  }
}
