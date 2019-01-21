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
package org.sonar.plugin.typescript.executable;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.apache.commons.io.FileUtils;

public class Zip {

  private Zip() {
    // utility class
  }

  public static void extract(InputStream bundle, File destination) throws IOException {
    ZipInputStream zip = new ZipInputStream(bundle);
    ZipEntry entry = zip.getNextEntry();
    if (entry == null) {
      throw new IllegalStateException("At least one entry expected.");
    }
    while (entry != null) {
      File entryDestination = new File(destination, entry.getName());
      if (entry.isDirectory()) {
        entryDestination.mkdirs();
      } else {
        FileUtils.copyToFile(zip, entryDestination);
      }
      zip.closeEntry();
      entry = zip.getNextEntry();
    }
  }
}
