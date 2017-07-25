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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
const scanner = require("sonarqube-scanner");

const branch = process.env.TRAVIS_BRANCH;
const pullRequest = process.env.TRAVIS_PULL_REQUEST;

if (branch === "master" && pullRequest === "false") {
  const serverUrl = process.env.SONAR_HOST_URL;
  const token = process.env.SONAR_TOKEN;

  scanner(
    {
      serverUrl,
      token,
      options: {
        "sonar.sources": "src",
        "sonar.tests": "tests",
      },
    },
    () => {
      // callback is required
    },
  );
}
